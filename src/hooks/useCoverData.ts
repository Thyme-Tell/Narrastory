
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { Json } from "@/integrations/supabase/types";

// Get Supabase URL from the client configuration file
const SUPABASE_URL = "https://pohnhzxqorelllbfnqyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG5oenhxb3JlbGxsYmZucXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Njk1MzAsImV4cCI6MjA1MzE0NTUzMH0.nG7V_e8Izqi-pXHw1HoaYAC4hediI0D9l_Qf9De93C0";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to fetch cover data
  const fetchCoverData = async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    try {
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

      console.log('Received cover data:', data);
      
      if (data && data.cover_data) {
        setCoverData(data.cover_data as CoverData);
      } else {
        // If no cover data exists yet, create a new record with default data
        console.log('Creating new cover data with defaults');
        await saveCoverData(DEFAULT_COVER_DATA);
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
  };

  useEffect(() => {
    fetchCoverData();
  }, [profileId]);

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
      
      // Update local state with the saved data
      setCoverData(newCoverData);
      
      // Refetch the data to ensure we have the latest from the server
      await fetchCoverData();
      
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
    coverData,
    isLoading,
    error,
    saveCoverData,
    refreshCoverData: fetchCoverData
  };
}
