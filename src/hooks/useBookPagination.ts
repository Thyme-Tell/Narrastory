
import { useState, useEffect } from "react";
import { Story } from "@/types/supabase";
import { calculateStoryPages } from "@/utils/bookPagination";
import { StoryMediaItem } from "@/types/media";

type StoryInfo = {
  story?: Story;
  pageWithinStory?: number;
  totalPagesInStory?: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
  isTableOfContentsPage?: boolean;
} | null;

/**
 * Hook to manage pagination and page calculation for the book
 */
export const useBookPagination = (
  stories: Story[] | undefined, 
  storyMediaMap: Map<string, StoryMediaItem[]>,
  initialPage: number = 0
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // Cover page by default

  // Calculate page distribution for stories using our pagination logic
  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just cover page
      return;
    }

    let pageCount = 1; // Start with cover page only
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
  const getCurrentStory = (): StoryInfo => {
    if (currentPage === 0) {
      return null; // Cover page
    }
    
    if (!stories || stories.length === 0) {
      return null;
    }
    
    let currentPageCount = 1; // Start after cover
    
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

  // Jump to specific page
  const jumpToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPageCount) {
      setCurrentPage(pageIndex);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    storyPages,
    totalPageCount,
    goToNextPage,
    goToPrevPage,
    getCurrentStory,
    jumpToPage
  };
};
