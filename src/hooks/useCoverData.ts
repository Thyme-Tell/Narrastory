import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const fetchCoverData = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching cover data for profile:', profileId);
      
      const cachedData = localStorage.getItem(`cover_data_${profileId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as CoverData;
        console.log('Using cached cover data while fetching from server:', parsedData);
        setCoverData(parsedData);
      }
      
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
        const typedCoverData = data.cover_data as CoverData;
        console.log('Setting cover data from database:', typedCoverData);
        setCoverData(typedCoverData);
        
        localStorage.setItem(`cover_data_${profileId}`, JSON.stringify(typedCoverData));
        localStorage.setItem(`cover_data_last_fetched_${profileId}`, new Date().toISOString());
        localStorage.setItem(`cover_data_updated_at_${profileId}`, data.updated_at);
      } else {
        console.log('No cover data found, using defaults with profile name');
        if (!cachedData) {
          const defaultData = { ...DEFAULT_COVER_DATA };
          if (profile) {
            const authorName = `${profile.first_name} ${profile.last_name}`.trim();
            defaultData.authorText = authorName;
          }
          setCoverData(defaultData);
        }
      }
    } catch (err) {
      console.error("Error in fetchCoverData:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover data",
      });
      if (!localStorage.getItem(`cover_data_${profileId}`)) {
        const defaultData = { ...DEFAULT_COVER_DATA };
        if (profile) {
          const authorName = `${profile.first_name} ${profile.last_name}`.trim();
          defaultData.authorText = authorName;
        }
        setCoverData(defaultData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast, profile]);

  useEffect(() => {
    console.log('Profile ID in useCoverData:', profileId);
    if (profileId) {
      fetchCoverData();
    } else {
      const defaultData = { ...DEFAULT_COVER_DATA };
      if (profile) {
        const authorName = `${profile.first_name} ${profile.last_name}`.trim();
        defaultData.authorText = authorName;
      }
      setCoverData(defaultData);
      setIsLoading(false);
    }
  }, [profileId, fetchCoverData, profile]);

  const saveCoverData = async (newCoverData: CoverData) => {
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
      
      // Ensure we preserve the backgroundImage value exactly as provided
      const dataToSave = {
        ...newCoverData,
        backgroundImage: newCoverData.backgroundImage // Don't modify the value
      };
      
      console.log('Data being saved:', dataToSave);
      
      localStorage.setItem(`cover_data_${profileId}`, JSON.stringify(dataToSave));
      localStorage.setItem(`cover_data_saving_${profileId}`, new Date().toISOString());
      
      setCoverData(dataToSave);
      
      const { data, error } = await supabase.functions.invoke('save-cover-data', {
        method: 'POST',
        body: {
          profileId: profileId,
          coverData: dataToSave
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
    coverData: coverData || (profile ? 
      { ...DEFAULT_COVER_DATA, authorText: `${profile.first_name} ${profile.last_name}`.trim() } : 
      DEFAULT_COVER_DATA),
    isLoading,
    error,
    saveCoverData,
    refreshCoverData: fetchCoverData
  };
}
