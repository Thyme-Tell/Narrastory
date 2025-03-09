
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { calculateTotalPages } from "@/utils/bookPagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

// Constants for book dimensions and content
const CHARS_PER_LINE = 45; // Reduced from 50 to be more conservative
const LINES_PER_PAGE = 26; // Increased from 23 to reduce bottom margin
const PAGE_MARGIN_LINES = 4; // Reduced from 6 to allow more content

// Export the BookProgress component as a named export
export function BookProgress({ profileId }: { profileId?: string }) {
  const [storyMediaMap, setStoryMediaMap] = useState<Map<string, StoryMediaItem[]>>(new Map());

  const { data: stories, isLoading: isLoadingStories } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, profile_id, share_token")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData as Story[];
    },
    enabled: !!profileId,
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["media", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from("story_media")
        .select("id, story_id, file_path, content_type, file_name, caption, created_at")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
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

  const totalPages = stories && stories.length > 0 
    ? calculateTotalPages(stories, storyMediaMap)
    : 1;

  if (isLoadingStories || isLoadingMedia) {
    return <div className="p-4 bg-white/90 rounded-lg shadow-sm">Loading book progress...</div>;
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="p-4 bg-white/90 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-2">Your Book</h3>
        <p className="text-muted-foreground mb-3">Start adding stories to create your book!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/90 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">Your Book</h3>
          <p className="text-muted-foreground">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'} so far
          </p>
        </div>
        {profileId && (
          <Link to={`/profile/${profileId}/book-preview`}>
            <Button variant="outline" className="text-[#A33D29] border-[#A33D29]">
              Preview Book
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-1">
        {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
          <div 
            key={i} 
            className="h-1.5 bg-[#A33D29] rounded-full"
            style={{ width: `${100 / Math.min(totalPages, 10)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
