
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";

// Get Supabase URL from the client configuration file
const SUPABASE_URL = "https://pohnhzxqorelllbfnqyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG5oenhxb3JlbGxsYmZucXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Njk1MzAsImV4cCI6MjA1MzE0NTUzMH0.nG7V_e8Izqi-pXHw1HoaYAC4hediI0D9l_Qf9De93C0";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to fetch cover data
  const fetchCoverData = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching cover data for profile:', profileId);
      
      // First, try to fetch existing cover data
      const { data, error } = await supabase
        .from('book_covers')
        .select('cover_data')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cover data:', error);
        throw error;
      }

      console.log('Received cover data from database:', data);
      
      if (data && data.cover_data) {
        // Explicitly cast and set the cover data
        const typedCoverData = data.cover_data as CoverData;
        console.log('Setting cover data from database:', typedCoverData);
        setCoverData(typedCoverData);
      } else {
        // If no cover data exists yet, create a new record with default data
        console.log('No cover data found, creating with defaults');
        await saveCoverData(DEFAULT_COVER_DATA);
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
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast]);

  // Initial data fetch
  useEffect(() => {
    console.log('Profile ID in useCoverData:', profileId);
    if (profileId) {
      fetchCoverData();
    }
  }, [profileId, fetchCoverData]);

  const saveCoverData = async (newCoverData: CoverData) => {
    if (!profileId) return false;

    try {
      console.log('Saving cover data:', newCoverData);
      
      // Use Edge Function to save cover data (bypasses RLS)
      const response = await fetch(`${SUPABASE_URL}/functions/v1/save-cover-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          profileId: profileId,
          coverData: newCoverData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from edge function:', errorData);
        throw new Error(errorData.error || 'Failed to save cover data');
      }
      
      const result = await response.json();
      console.log('Cover data saved successfully:', result);
      
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
        description: "Failed to save cover data",
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
