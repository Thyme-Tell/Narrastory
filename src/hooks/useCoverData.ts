
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCoverData, saveCoverData as apiSaveCoverData } from "@/api/coverDataService";
import { 
  getCachedCoverData, 
  cacheCoverData, 
  markCoverDataSaved, 
  markCoverDataSaving 
} from "@/utils/coverDataCache";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Function to fetch cover data
  const refreshCoverData = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching cover data for profile:', profileId);
      
      // First, try to get data from localStorage cache for immediate display
      const cachedData = getCachedCoverData(profileId);
      if (cachedData) {
        console.log('Using cached cover data while fetching from server:', cachedData);
        setCoverData(cachedData);
      }
      
      // Then fetch from server to ensure we have the latest
      const data = await fetchCoverData(profileId);

      if (data && data.cover_data) {
        // Explicitly cast and set the cover data
        const typedCoverData = data.cover_data as CoverData;
        console.log('Setting cover data from database:', typedCoverData);
        setCoverData(typedCoverData);
        
        // Update local cache
        cacheCoverData(profileId, typedCoverData);
        markCoverDataSaved(profileId, data.updated_at);
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
      if (!getCachedCoverData(profileId)) {
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
      refreshCoverData();
    } else {
      // If no profileId, set defaults and not loading
      setCoverData(DEFAULT_COVER_DATA);
      setIsLoading(false);
    }
  }, [profileId, refreshCoverData]);

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
      setIsSaving(true);
      
      // Update local cache immediately for responsiveness
      cacheCoverData(profileId, newCoverData);
      markCoverDataSaving(profileId);
      
      // Update local state right away
      setCoverData(newCoverData);
      
      // Direct call to the Supabase Edge Function via our API service
      await apiSaveCoverData(profileId, newCoverData);
      
      markCoverDataSaved(profileId);
      
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
    } finally {
      setIsSaving(false);
    }
  };

  return {
    coverData: coverData || DEFAULT_COVER_DATA,
    isLoading,
    isSaving,
    error,
    saveCoverData,
    refreshCoverData
  };
}
