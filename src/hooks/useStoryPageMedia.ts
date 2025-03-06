
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";

export const useStoryPageMedia = (storyId: string) => {
  const { data: mediaItems = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
      }

      // Transform the data to include full URLs
      return (data || []).map((item: StoryMediaItem) => ({
        ...item,
        file_path: supabase.storage
          .from("story-media")
          .getPublicUrl(item.file_path).data.publicUrl
      }));
    },
    enabled: !!storyId,
  });

  return { mediaItems, isMediaLoading };
};
