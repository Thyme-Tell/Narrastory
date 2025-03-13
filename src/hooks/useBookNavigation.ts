
import { useEffect } from "react";
import { Story } from "@/types/supabase";
import { useStoryMedia } from "./useStoryMedia";
import { useBookPagination } from "./useBookPagination";
import { useBookFeatures } from "./useBookFeatures";

export const useBookNavigation = (stories: Story[] | undefined, open: boolean) => {
  // Use the smaller, focused hooks
  const { storyMediaMap } = useStoryMedia(stories);
  const { 
    currentPage, 
    setCurrentPage,
    storyPages,
    totalPageCount,
    goToNextPage, 
    goToPrevPage,
    getCurrentStory,
    jumpToPage
  } = useBookPagination(stories, storyMediaMap);
  
  const {
    zoomLevel,
    showToc,
    setShowToc,
    bookmarks,
    zoomIn,
    zoomOut,
    toggleBookmark: toggleBookmarkBase
  } = useBookFeatures(open);

  // Wrap toggleBookmark to automatically use current page
  const toggleBookmark = () => toggleBookmarkBase(currentPage);

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setCurrentPage(0);
    }
  }, [open, setCurrentPage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowRight":
          goToNextPage();
          break;
        case "ArrowLeft":
          goToPrevPage();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToNextPage, goToPrevPage]);

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
