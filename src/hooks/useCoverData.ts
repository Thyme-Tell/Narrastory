
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";

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
        const { data, error } = await supabase
          .from('book_covers')
          .select('cover_data')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setCoverData(data.cover_data as CoverData);
        } else {
          // If no cover data exists yet, create a new record with default data
          const { data: newData, error: insertError } = await supabase
            .from('book_covers')
            .insert({ 
              profile_id: profileId,
              cover_data: DEFAULT_COVER_DATA 
            })
            .select('cover_data')
            .single();

          if (insertError) throw insertError;
          
          setCoverData(newData.cover_data as CoverData);
        }
      } catch (err) {
        console.error("Error fetching cover data:", err);
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
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('book_covers')
        .upsert({ 
          profile_id: profileId,
          cover_data: newCoverData 
        });

      if (error) throw error;

      setCoverData(newCoverData);
      return true;
    } catch (err) {
      console.error("Error saving cover data:", err);
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
