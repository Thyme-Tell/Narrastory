import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { useAuth } from "@/contexts/AuthContext";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Function to fetch cover data
  const fetchCoverData = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching cover data for profile:', profileId);
      
      // First, try to get data from localStorage cache for immediate display
      const cachedData = localStorage.getItem(`cover_data_${profileId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as CoverData;
        console.log('Using cached cover data while fetching from server:', parsedData);
        setCoverData(parsedData);
      }
      
      // Then fetch from server to ensure we have the latest
      const { data, error } = await supabase
        .from('book_covers')
        .select('cover_data, updated_at')
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
        
        // Update local cache
        localStorage.setItem(`cover_data_${profileId}`, JSON.stringify(typedCoverData));
        localStorage.setItem(`cover_data_last_fetched_${profileId}`, new Date().toISOString());
        localStorage.setItem(`cover_data_updated_at_${profileId}`, data.updated_at);
      } else {
        // If no cover data exists yet, use defaults but don't save until user makes changes
        console.log('No cover data found, using defaults');
        if (!cachedData) {
          setCoverData(DEFAULT_COVER_DATA);
        }
        // If we had cached data but no server data, keep using the cached data
      }
    } catch (err) {
      console.error("Error in fetchCoverData:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover data",
      });
      // Even on error, use the default data if we don't have cached data
      if (!localStorage.getItem(`cover_data_${profileId}`)) {
        setCoverData(DEFAULT_COVER_DATA);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast]);

  // Initial data fetch
  useEffect(() => {
    console.log('Profile ID in useCoverData:', profileId);
    if (profileId) {
      fetchCoverData();
    } else {
      // If no profileId, set defaults and not loading
      setCoverData(DEFAULT_COVER_DATA);
      setIsLoading(false);
    }
  }, [profileId, fetchCoverData]);

  const saveCoverData = async (newCoverData: CoverData) => {
    // Check for profile ID first
    if (!profileId) {
      console.error("Cannot save: No profile ID provided");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to identify which profile to save to",
      });
      return false;
    }

    try {
      console.log('Saving cover data:', newCoverData);
      
      // Update local cache immediately for responsiveness
      localStorage.setItem(`cover_data_${profileId}`, JSON.stringify(newCoverData));
      localStorage.setItem(`cover_data_saving_${profileId}`, new Date().toISOString());
      
      // Update local state right away
      setCoverData(newCoverData);
      
      // Direct call to the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('save-cover-data', {
        method: 'POST',
        body: {
          profileId: profileId,
          coverData: newCoverData
        },
      });

      if (error) {
        console.error('Error from save-cover-data function:', error);
        throw new Error(error.message || 'Failed to save cover data');
      }
      
      console.log('Response from save-cover-data function:', data);
      
      localStorage.setItem(`cover_data_saved_at_${profileId}`, new Date().toISOString());
      
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
