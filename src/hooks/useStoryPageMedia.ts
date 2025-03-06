
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";
import { useIsMobile } from "@/hooks/use-mobile";

export const useStoryPageMedia = (storyId: string) => {
  const isMobile = useIsMobile();
  
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

      // Optimize media items for mobile if needed
      if (isMobile) {
        // We could modify media items for mobile here if needed
        // For now, we're just returning them as is
      }

      return data as StoryMediaItem[];
    },
  });

  return { mediaItems, isMediaLoading };
};
