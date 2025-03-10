
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { calculateTotalPages } from "@/utils/bookPagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Progress } from "./ui/progress";

// Export the BookProgress component as a named export
export function BookProgress({ profileId }: { profileId?: string }) {
  const [storyMediaMap, setStoryMediaMap] = useState<Map<string, StoryMediaItem[]>>(new Map());

  // Define explicit type for stories query result
  const { data: stories, isLoading: isLoadingStories } = useQuery<Story[], Error>({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      if (!profileId) return [] as Story[];
      
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, profile_id, share_token")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [] as Story[];
      }

      return storiesData as Story[];
    },
    enabled: !!profileId,
  });

  // Define explicit type for media items query result
  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<StoryMediaItem[], Error>({
    queryKey: ["media", profileId],
    queryFn: async () => {
      if (!profileId) return [] as StoryMediaItem[];
      
      const { data, error } = await supabase
        .from("story_media")
        .select("id, story_id, file_path, content_type, file_name, caption, created_at")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [] as StoryMediaItem[];
      }

      return data as StoryMediaItem[];
    },
    enabled: !!profileId,
  });

  // Organize media items by story
  useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      const mediaMap = new Map<string, StoryMediaItem[]>();
      
      mediaItems.forEach(item => {
        if (item && item.story_id) {
          const existingItems = mediaMap.get(item.story_id) || [];
          mediaMap.set(item.story_id, [...existingItems, item]);
        }
      });
      
      setStoryMediaMap(mediaMap);
    }
  }, [mediaItems]);

  // Create a type guard to properly narrow the type
  const hasStories = Array.isArray(stories) && stories.length > 0;
  
  // Initialize totalPages with a default value
  let totalPages = 1; // Default to 1 page (cover page)

  // Only call calculateTotalPages when stories exist
  if (hasStories) {
    totalPages = calculateTotalPages(stories, storyMediaMap);
  }

  if (isLoadingStories || isLoadingMedia) {
    return <div className="p-4 bg-white rounded-lg shadow-sm">Loading book progress...</div>;
  }

  if (!hasStories) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-2">Your Book</h3>
        <p className="text-muted-foreground mb-3">Start adding stories to create your book!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">Your Book</h3>
          <p className="text-muted-foreground">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'} so far
          </p>
        </div>
        {profileId && (
          <Link to={`/profile/${profileId}/book-preview`}>
            <Button variant="outline" className="text-apache border-apache">
              Preview Book
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
          <div 
            key={i} 
            className="h-2 bg-apache rounded-full flex-1"
          />
        ))}
      </div>
    </div>
  );
}
