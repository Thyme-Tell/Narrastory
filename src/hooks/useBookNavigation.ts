import { useState, useEffect } from "react";
import { Story } from "@/types/supabase";
import { calculateStoryPages } from "@/utils/bookPagination";
import { StoryMediaItem } from "@/types/media";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookNavigation = (stories: Story[] | undefined, open: boolean) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // TOC page by default
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

  // Calculate page distribution for stories using our pagination logic
  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just TOC page
      return;
    }

    let pageCount = 1; // Start with TOC page only
    const pageStartIndices: number[] = [];

    // Calculate starting page for each story
    stories.forEach((story) => {
      pageStartIndices.push(pageCount);
      pageCount += calculateStoryPages(story);
      
      // Add pages for media items if any
      const mediaItems = storyMediaMap.get(story.id) || [];
      pageCount += mediaItems.length;
    });

    setStoryPages(pageStartIndices);
    setTotalPageCount(pageCount);
  }, [stories, storyMediaMap]);

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Find which story is displayed on the current page
  const getCurrentStory = () => {
    if (currentPage === 0) {
      return { isTableOfContentsPage: true }; // TOC page is now the first page
    }
    
    if (!stories || stories.length === 0) {
      return null;
    }
    
    let currentPageCount = 1; // Start after TOC
    
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const storyTextPages = calculateStoryPages(story);
      const mediaItems = storyMediaMap.get(story.id) || [];
      const totalStoryPages = storyTextPages + mediaItems.length;
      
      // If current page falls within this story's range
      if (currentPage < currentPageCount + totalStoryPages) {
        const pageOffset = currentPage - currentPageCount;
        
        // Check if it's a media page
        if (pageOffset >= storyTextPages && mediaItems.length > 0) {
          const mediaIndex = pageOffset - storyTextPages;
          if (mediaIndex < mediaItems.length) {
            return {
              story,
              pageWithinStory: 1, // Not relevant for media pages
              totalPagesInStory: totalStoryPages,
              isMediaPage: true,
              mediaItem: mediaItems[mediaIndex]
            };
          }
        }
        
        // Regular text page
        return {
          story,
          pageWithinStory: pageOffset + 1, // Convert to 1-based
          totalPagesInStory: totalStoryPages
        };
      }
      
      currentPageCount += totalStoryPages;
    }
    
    return null;
  };

  // Handle zoom controls
  const zoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  // Toggle bookmark for current page
  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(b => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  // Jump to specific page from TOC
  const jumpToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowToc(false);
  };

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setCurrentPage(0);
      setZoomLevel(1);
    }
  }, [open]);

  return {
    currentPage,
    setCurrentPage,
    zoomLevel,
    showToc,
    setShowToc,
    bookmarks,
    storyPages,
    totalPageCount,
    goToNextPage,
    goToPrevPage,
    getCurrentStory,
    zoomIn,
    zoomOut,
    toggleBookmark,
    jumpToPage,
    storyMediaMap
  };
};
