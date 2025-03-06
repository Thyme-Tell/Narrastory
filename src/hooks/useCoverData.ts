
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import Cookies from 'js-cookie';
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
        // If no cover data exists yet, use defaults but don't save until user makes changes
        console.log('No cover data found, using defaults');
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
    if (!profileId || !isAuthenticated) {
      console.error("Cannot save: No profile ID or not authenticated");
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to save cover data",
      });
      return false;
    }

    try {
      console.log('Saving cover data:', newCoverData);
      
      // Make sure we're using the exact profile ID that's associated with the authenticated user
      const authCookie = Cookies.get('profile_authorized');
      const currentProfileId = Cookies.get('profile_id');
      
      if (!authCookie || !currentProfileId) {
        console.error('Missing authentication cookies');
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "Please log in again to continue",
        });
        return false;
      }
      
      if (currentProfileId !== profileId) {
        console.error(`Authentication mismatch: User ${currentProfileId} trying to update profile ${profileId}`);
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "You can only edit your own book cover",
        });
        return false;
      }
      
      // Use supabase function to save data
      const { data, error } = await supabase
        .from('book_covers')
        .upsert({
          profile_id: profileId,
          cover_data: newCoverData as any, // Use type assertion for the JSON data
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'profile_id'
        });

      if (error) {
        console.error('Error saving cover data:', error);
        throw error;
      }
      
      console.log('Cover data saved successfully:', data);
      
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
