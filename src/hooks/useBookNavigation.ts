
import { useState, useEffect } from "react";
import { Story } from "@/types/supabase";
import { calculateStoryPages, calculateTotalPages, mapPageToStory } from "@/utils/bookPagination";

export const useBookNavigation = (stories: Story[] | undefined, open: boolean) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // Cover page by default

  // Calculate page distribution for stories using our pagination logic
  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just the cover
      return;
    }

    let pageCount = 1; // Start with cover page
    const pageStartIndices: number[] = [];

    // Calculate starting page for each story
    stories.forEach((story) => {
      pageStartIndices.push(pageCount);
      pageCount += calculateStoryPages(story);
    });

    setStoryPages(pageStartIndices);
    setTotalPageCount(calculateTotalPages(stories));
  }, [stories]);

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
    if (currentPage === 0 || !stories || stories.length === 0) {
      return null;
    }
    
    const mapping = mapPageToStory(currentPage, stories);
    return mapping.storyIndex >= 0 ? {
      story: stories[mapping.storyIndex],
      pageWithinStory: mapping.pageWithinStory,
      totalPagesInStory: calculateStoryPages(stories[mapping.storyIndex])
    } : null;
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
    jumpToPage
  };
};
