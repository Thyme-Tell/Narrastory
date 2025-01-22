import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useMediaOperations = (storyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMedia = useMutation({
    mutationFn: async ({ mediaId, file }: { mediaId: string; file: Blob }) => {
      const fileExt = "jpg";
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("story-media")
        .upload(filePath, file, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("story_media")
        .update({ file_path: filePath })
        .eq("id", mediaId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-media", storyId] });
      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const updateCaption = useMutation({
    mutationFn: async ({ mediaId, caption }: { mediaId: string; caption: string }) => {
      const { error } = await supabase
        .from("story_media")
        .update({ caption })
        .eq("id", mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-media", storyId] });
      toast({
        title: "Success",
        description: "Caption updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update caption",
        variant: "destructive",
      });
    },
  });

  return {
    updateMedia,
    updateCaption,
  };
};