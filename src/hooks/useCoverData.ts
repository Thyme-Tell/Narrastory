
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type CoverData = {
  backgroundColor?: string;
  backgroundImage?: string;
  title?: string;
  titlePosition?: 'center' | 'top' | 'bottom';
  titleColor?: string;
  subtitle?: string;
  subtitlePosition?: 'center' | 'top' | 'bottom';
  subtitleColor?: string;
  authorName?: string;
  customImages?: Array<{
    id: string;
    url: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
  }>;
};

export const useCoverData = (profileId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: coverData, isLoading: isFetching } = useQuery({
    queryKey: ["coverData", profileId],
    queryFn: async () => {
      try {
        // First try to get data directly from the database
        const { data, error } = await supabase
          .from("book_covers")
          .select("cover_data")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (!error && data) {
          return (data?.cover_data as CoverData) || {} as CoverData;
        }

        // If that fails (e.g., due to RLS), use the edge function
        const { session } = await supabase.auth.getSession();
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/cover-operations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            operation: 'get',
            profileId
          })
        });

        if (!response.ok) {
          throw new Error(`Error fetching cover data: ${response.statusText}`);
        }

        const result = await response.json();
        return (result.coverData as CoverData) || {} as CoverData;
      } catch (error) {
        console.error("Error fetching cover data:", error);
        return {} as CoverData;
      }
    },
    enabled: !!profileId,
  });

  const updateCoverData = useMutation({
    mutationFn: async (newCoverData: CoverData) => {
      setIsLoading(true);
      
      try {
        // First try direct database update
        const { data, error } = await supabase
          .from("book_covers")
          .upsert(
            { 
              profile_id: profileId, 
              cover_data: newCoverData 
            },
            { 
              onConflict: "profile_id",
              ignoreDuplicates: false 
            }
          )
          .select();

        if (!error) {
          return data;
        }

        // If direct update fails, use the edge function
        const { session } = await supabase.auth.getSession();
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/cover-operations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            operation: 'update',
            profileId,
            coverData: newCoverData
          })
        });

        if (!response.ok) {
          throw new Error(`Error updating cover data: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Cover updated",
        description: "Your book cover has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["coverData", profileId] });
    },
    onError: (error) => {
      console.error("Error updating cover data:", error);
      toast({
        title: "Error updating cover",
        description: "Could not update your book cover. Please try again.",
        variant: "destructive",
      });
    }
  });

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Create the storage bucket if it doesn't exist
      await fetch(`${supabase.supabaseUrl}/functions/v1/create-storage-bucket`, {
        method: 'POST'
      });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('book_covers')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('book_covers')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload your image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    coverData: coverData || {},
    isLoading: isLoading || isFetching,
    updateCoverData: updateCoverData.mutate,
    uploadCoverImage,
  };
};
