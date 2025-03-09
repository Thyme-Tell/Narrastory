
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
    if (isMobile && bookContainerRef.current) {
      bookContainerRef.current.style.touchAction = 'pan-y';
      
      // iOS-specific fix: force layout recalculation
      if (isIOSDevice) {
        setTimeout(() => {
          if (bookContainerRef.current) {
            bookContainerRef.current.style.opacity = '0.99';
            requestAnimationFrame(() => {
              if (bookContainerRef.current) {
                bookContainerRef.current.style.opacity = '1';
              }
            });
          }
        }, 200);
      }
    }
  }, [isMobile, isIOSDevice]);

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
