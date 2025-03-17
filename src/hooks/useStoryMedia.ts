
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";

export const useStoryMedia = (storyId: string | undefined) => {
  return useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      if (!storyId) {
        return [];
      }

      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Process media items to ensure they're ready for book display
      return (data || []).map((item: StoryMediaItem) => ({
        ...item,
        // Add any additional processing for book display if needed
        display_ready: true,
      }));
    },
    enabled: !!storyId, // Only run the query if storyId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
