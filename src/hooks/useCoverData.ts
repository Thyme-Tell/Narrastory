
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { Json } from "@/integrations/supabase/types";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCoverData() {
      if (!profileId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching cover data for profile:', profileId);
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
        
        if (data) {
          setCoverData(data.cover_data as CoverData);
        } else {
          // If no cover data exists yet, create a new record with default data
          console.log('Creating new cover data with defaults');
          const { data: newData, error: insertError } = await supabase
            .from('book_covers')
            .insert({ 
              profile_id: profileId,
              cover_data: DEFAULT_COVER_DATA as unknown as Json
            })
            .select('cover_data')
            .single();

          if (insertError) {
            console.error('Error creating cover data:', insertError);
            throw insertError;
          }
          
          console.log('Created new cover data:', newData);
          setCoverData(newData.cover_data as CoverData);
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
    }

    fetchCoverData();
  }, [profileId]);

  const saveCoverData = async (newCoverData: CoverData) => {
    if (!profileId) return false;

    try {
      console.log('Saving cover data:', newCoverData);
      const { error } = await supabase
        .from('book_covers')
        .upsert({ 
          profile_id: profileId,
          cover_data: newCoverData as unknown as Json
        });

      if (error) {
        console.error('Error saving cover data:', error);
        throw error;
      }

      console.log('Cover data saved successfully');
      setCoverData(newCoverData);
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
  };
}
