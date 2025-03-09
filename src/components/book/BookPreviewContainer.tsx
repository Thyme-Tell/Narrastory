
import React, { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookPreviewContent from "./BookPreviewContent";

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
    </div>
  );
};

export default BookPreviewContainer;
