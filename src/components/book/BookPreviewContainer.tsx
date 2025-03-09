
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
    console.log("BookPreviewContainer mounted, isMobile:", isMobile);
    
    // Setup touch event handling for mobile
    if (isMobile && bookContainerRef.current) {
      bookContainerRef.current.style.touchAction = 'pan-y';
      
      // iOS-specific fix: force layout recalculation
      if (isIOSDevice) {
        setTimeout(() => {
          // Force repaint by temporarily changing opacity
          if (bookContainerRef.current) {
            bookContainerRef.current.style.opacity = '0.99';
            requestAnimationFrame(() => {
              if (bookContainerRef.current) {
                bookContainerRef.current.style.opacity = '1';
                console.log("iOS repaint forced");
              }
            });
          }
        }, 200);
      }
    }
  }, [isMobile, isIOSDevice]);

  return (
    <div 
      className={`flex-1 h-full flex flex-col items-center justify-center p-4 overflow-auto book-preview-mobile-container ${isMobile ? 'pt-2 pb-6' : 'p-4'} ${isIOSDevice ? 'ios-safari-render-fix' : ''}`}
      ref={bookContainerRef}
      style={{
        /* iOS specific rendering fixes */
        ...(isIOSDevice ? {
          WebkitTransform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          WebkitPerspective: '1000',
        } : {})
      }}
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
