
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { Json } from "@/integrations/supabase/types";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to fetch cover data
  const fetchCoverData = useCallback(async () => {
    if (!profileId) {
      console.log('No profileId provided, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching cover data for profile:', profileId);
      
      // First, try to fetch existing cover data
      const { data, error, status } = await supabase
        .from('book_covers')
        .select('cover_data, id')
        .eq('profile_id', profileId)
        .maybeSingle();

      console.log('Database query status:', status);
      console.log('Raw response from database:', data);
      
      if (error) {
        console.error('Error fetching cover data:', error);
        throw new Error(`Failed to fetch cover data: ${error.message}`);
      }

      if (data && data.cover_data) {
        // Log the actual data received
        console.log('Cover data found in database with ID:', data.id);
        console.log('Cover data from database:', data.cover_data);
        
        // Explicitly cast and set the cover data
        const typedCoverData = data.cover_data as unknown as CoverData;
        console.log('Setting cover data from database:', typedCoverData);
        setCoverData(typedCoverData);
      } else {
        // If no cover data exists yet, use defaults but don't save until user makes changes
        console.log('No cover data found for profile ID:', profileId);
        console.log('Using defaults');
        setCoverData(DEFAULT_COVER_DATA);
      }
    } catch (err) {
      console.error("Error in fetchCoverData:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover data",
      });
      // Even on error, use the default data
      setCoverData(DEFAULT_COVER_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast]);

  // Initial data fetch
  useEffect(() => {
    console.log('Profile ID changed in useCoverData:', profileId);
    if (profileId) {
      fetchCoverData();
    } else {
      // If no profileId, set defaults and not loading
      console.log('No profileId, setting defaults');
      setCoverData(DEFAULT_COVER_DATA);
      setIsLoading(false);
    }
  }, [profileId, fetchCoverData]);

  const saveCoverData = async (newCoverData: CoverData) => {
    if (!profileId) {
      console.error('Cannot save cover data: No profile ID provided');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot save cover data: missing profile ID",
      });
      return false;
    }

    try {
      console.log('Preparing to save cover data for profile:', profileId);
      console.log('Cover data to save:', newCoverData);
      
      // Try direct database upsert first
      console.log('Attempting direct database upsert');
      const { data: upsertData, error: upsertError } = await supabase
        .from('book_covers')
        .upsert({
          profile_id: profileId,
          cover_data: newCoverData as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'profile_id'
        });
      
      if (upsertError) {
        console.error('Direct upsert failed:', upsertError);
        console.log('Falling back to edge function');
        
        // Use the edge function as fallback
        const response = await fetch(
          `https://pohnhzxqorelllbfnqyj.supabase.co/functions/v1/save-cover-data`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileId,
              coverData: newCoverData
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response from save-cover-data:', response.status, errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: 'Could not parse error response' };
          }
          throw new Error(`Server error (${response.status}): ${errorData.error || errorText || 'Unknown error'}`);
        }
        
        const responseData = await response.json();
        console.log('Cover data saved successfully through edge function:', responseData);
      } else {
        console.log('Direct upsert successful:', upsertData);
      }
      
      // Update local state right away
      setCoverData(newCoverData);
      
      toast({
        title: "Cover saved",
        description: "Your book cover preferences have been saved successfully",
      });
      
      return true;
    } catch (err) {
      console.error("Error in saveCoverData:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save cover data: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
      return false;
    }
  };

  return {
    coverData: coverData || DEFAULT_COVER_DATA,
    isLoading,
    error,
    saveCoverData,
    refreshCoverData: fetchCoverData
  };
}
