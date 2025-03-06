
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";
import { useIsMobile } from "@/hooks/use-mobile";

export const useStoryPageMedia = (storyId: string) => {
  const isMobile = useIsMobile();
  
  const { data: mediaItems = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      if (!storyId) {
        console.warn("No storyId provided to useStoryPageMedia");
        return [];
      }
      
      console.log(`Fetching media for story: ${storyId}`);
      
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log(`No media found for story: ${storyId}`);
        return [];
      }
      
      console.log(`Found ${data.length} media items for story: ${storyId}`);
      
      // Process and validate media items
      const processedMedia = data.map(item => {
        // Get public URL for the media item
        const { data: storageData } = supabase.storage
          .from("story-media")
          .getPublicUrl(item.file_path);
          
        // Add the public URL to the media item
        return {
          ...item,
          publicUrl: storageData.publicUrl
        };
      });

      // Optimize media items for mobile if needed
      if (isMobile) {
        // Adjust media item properties for mobile
        return processedMedia.map(item => ({
          ...item,
          // No resize needed for now, just returning as is
        }));
      }

      return processedMedia as (StoryMediaItem & { publicUrl: string })[];
    },
  });

  return { 
    mediaItems: mediaItems as (StoryMediaItem & { publicUrl: string })[], 
    isMediaLoading 
  };
};
