import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";

export const useStoryPageMedia = (storyId: string) => {
  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      if (!storyId) return [];
      
      console.log(`Fetching media for story ID: ${storyId}`);
      
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
      }

      console.log(`Raw media items for story ${storyId}:`, data);

      // Transform the data to include full URLs
      const transformedData = (data || []).map((item: any) => {
        // If the item already has a full URL, use it
        if (item.file_path && (item.file_path.startsWith('http://') || item.file_path.startsWith('https://'))) {
          console.log(`Item already has full URL: ${item.file_path}`);
          return item;
        }
        
        // Otherwise, create a full public URL for the media item
        try {
          const publicUrl = supabase.storage
            .from("story-media")
            .getPublicUrl(item.file_path).data.publicUrl;
            
          console.log(`Created public URL for ${item.file_path}: ${publicUrl}`);
          
          return {
            ...item,
            file_path: publicUrl // Replace with the full URL
          };
        } catch (err) {
          console.error(`Error creating public URL for file path: ${item.file_path}`, err);
          return item; // Return original item if URL creation fails
        }
      });

      console.log(`Transformed media items:`, transformedData);
      return transformedData;
    },
    enabled: !!storyId,
  });

  return { mediaItems, isLoading };
};
