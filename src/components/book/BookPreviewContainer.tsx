
import React, { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookPreviewContent from "./BookPreviewContent";
import BookPreviewPageContent from "./BookPreviewPageContent";

interface BookPreviewContainerProps {
  currentPage: number;
  totalPageCount: number;
  zoomLevel: number;
  stories: any[] | undefined;
  isStoriesLoading: boolean;
  isCoverLoading: boolean;
  coverData: any;
  authorName: string;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  currentStoryInfo: any;
  isIOSDevice: boolean;
}

const BookPreviewContainer = ({
  currentPage,
  totalPageCount,
  zoomLevel,
  stories,
  isStoriesLoading,
  isCoverLoading,
  coverData,
  authorName,
  goToNextPage,
  goToPrevPage,
  currentStoryInfo,
  isIOSDevice
}: BookPreviewContainerProps) => {
  const isMobile = useIsMobile();
  const bookContainerRef = useRef<HTMLDivElement>(null);
  
  // Setup touch events and iOS fixes
  useEffect(() => {
    if (bookContainerRef.current) {
      // Set fixed dimensions for consistent layout
      const container = bookContainerRef.current;
      
      // Force appropriate sizing
      if (isMobile) {
        container.style.touchAction = 'pan-y';
        
        // iOS-specific fix
        if (isIOSDevice) {
          setTimeout(() => {
            if (container) {
              // Force layout recalculation
              container.style.opacity = '0.99';
              requestAnimationFrame(() => {
                if (container) {
                  container.style.opacity = '1';
                }
              });
            }
          }, 200);
        }
      }
    }
  }, [isMobile, isIOSDevice]);

  // Handle swipe navigation on mobile
  useEffect(() => {
    if (!isMobile || !bookContainerRef.current) return;
    
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;
      
      // Threshold for swipe detection
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe right - go to previous page
          goToPrevPage();
        } else {
          // Swipe left - go to next page
          goToNextPage();
        }
      }
    };
    
    const container = bookContainerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, goToNextPage, goToPrevPage]);

  // Use a query parameter to toggle between rendering modes
  const useExactMode = new URLSearchParams(window.location.search).get('exactMode') === 'true';

  return (
    <div 
      className="book-preview-outer-container"
      ref={bookContainerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: isMobile ? "2px 0 6px" : "16px",
        ...(isIOSDevice ? {
          WebkitTransform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          WebkitPerspective: '1000',
        } : {})
      }}
      data-page={currentPage}
      data-total-pages={totalPageCount}
    >
      {useExactMode ? (
        // New exact 5x8 inch rendering with 1-inch margins
        <BookPreviewPageContent
          stories={stories}
          currentPage={currentPage}
          currentStoryInfo={currentStoryInfo}
          coverData={coverData}
          authorName={authorName}
          zoomLevel={zoomLevel}
          isMobile={isMobile}
        />
      ) : (
        // Original rendering method
        <BookPreviewContent
          currentPage={currentPage}
          totalPageCount={totalPageCount}
          zoomLevel={zoomLevel}
          stories={stories}
          isStoriesLoading={isStoriesLoading}
          isCoverLoading={isCoverLoading}
          coverData={coverData}
          authorName={authorName}
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          currentStoryInfo={currentStoryInfo}
          isMobile={isMobile}
        />
      )}
      
      {/* Page navigation controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4 no-print">
        <button 
          onClick={goToPrevPage}
          disabled={currentPage === 0}
          className="p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="text-sm bg-white/80 px-3 py-1 rounded-full">
          {currentPage + 1} / {totalPageCount}
        </div>
        
        <button 
          onClick={goToNextPage}
          disabled={currentPage >= totalPageCount - 1}
          className="p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      
      {/* Display toggle for rendering modes */}
      <div className="absolute top-4 right-4 no-print">
        <a 
          href={`?exactMode=${!useExactMode}`}
          className="text-sm bg-white/80 px-3 py-1 rounded-full hover:bg-white"
        >
          {useExactMode ? "Standard View" : "Exact 5×8 View"}
        </a>
      </div>
    </div>
  );
};

export default BookPreviewContainer;
