
import { useState, useEffect } from "react";

/**
 * Hook to manage additional book features like bookmarks, zoom, and table of contents
 */
export const useBookFeatures = (initialOpen: boolean = false) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Handle zoom controls
  const zoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  // Toggle bookmark for current page
  const toggleBookmark = (currentPage: number) => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(b => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  // Reset zoom when reopening
  useEffect(() => {
    if (initialOpen) {
      setZoomLevel(1);
    }
  }, [initialOpen]);

  return {
    zoomLevel,
    showToc,
    setShowToc,
    bookmarks,
    zoomIn,
    zoomOut,
    toggleBookmark
  };
};
