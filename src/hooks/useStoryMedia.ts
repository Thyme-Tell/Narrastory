
import { useState, useEffect } from "react";
import { StoryMediaItem } from "@/types/media";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/types/supabase";

/**
 * Hook to fetch and organize media items for stories
 */
export const useStoryMedia = (stories: Story[] | undefined) => {
  const [storyMediaMap, setStoryMediaMap] = useState<Map<string, StoryMediaItem[]>>(new Map());

  // Fetch media items for all stories
  const { data: allMediaItems = [] } = useQuery({
    queryKey: ["all-story-media", stories?.map(s => s.id).join(",")],
    queryFn: async () => {
      if (!stories || stories.length === 0) return [];
      
      const storyIds = stories.map(s => s.id);
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .in("story_id", storyIds)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching story media:", error);
        return [];
      }

      return data as StoryMediaItem[];
    },
    enabled: !!stories && stories.length > 0,
  });

  // Organize media items by story ID
  useEffect(() => {
    if (allMediaItems.length > 0) {
      const mediaMap = new Map<string, StoryMediaItem[]>();
      
      allMediaItems.forEach(item => {
        const storyItems = mediaMap.get(item.story_id) || [];
        storyItems.push(item);
        mediaMap.set(item.story_id, storyItems);
      });
      
      setStoryMediaMap(mediaMap);
    }
  }, [allMediaItems]);

  return { storyMediaMap };
};
