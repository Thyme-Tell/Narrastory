
import React, { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
import BookPreviewControls from "./BookPreviewControls";
import { Story } from "@/types/supabase";
import { CoverData } from "@/components/cover/CoverTypes";
import { StoryMediaItem } from "@/types/media";

interface BookPreviewContentProps {
  currentPage: number;
  totalPageCount: number;
  zoomLevel: number;
  stories: Story[] | undefined;
  isStoriesLoading: boolean;
  isCoverLoading: boolean;
  coverData: CoverData;
  authorName: string;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  currentStoryInfo: {
    story?: Story;
    pageWithinStory?: number;
    totalPagesInStory?: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
    isTableOfContentsPage?: boolean;
  } | null;
  isMobile?: boolean;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
}

const BookPreviewContent = ({
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
  isMobile = false,
  onDownloadPDF,
  isGeneratingPDF
}: BookPreviewContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect for iOS-specific fixes
  useEffect(() => {
    if (isMobile && containerRef.current) {
      // Force repaint on iOS devices to fix rendering issues
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0.99';
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.opacity = '1';
            }
          }, 10);
        }
      }, 100);
    }
  }, [isMobile, currentPage]);
  
  // Get book title from cover data
  const bookTitle = coverData?.titleText || "My Book";

  return (
    <div className="w-full h-full flex items-center justify-center py-2 px-2">
      <div 
        className="relative bg-white shadow-xl rounded-md transition-transform mx-auto overflow-hidden book-format page-transition"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          aspectRatio: "5/8",
          maxHeight: "calc(100vh - 80px)", // Adjust for the bottom bar
          backgroundColor: "#f8f7f1",
          boxShadow: "0 4px 12px rgba(60, 42, 33, 0.2)",
          willChange: "transform",
          position: "relative",
          overflow: "hidden"
        }}
        data-is-mobile={isMobile ? "true" : "false"}
        data-page-number={currentPage}
        data-zoom-level={zoomLevel}
        ref={containerRef}
      >
        {/* Book Pages */}
        {isStoriesLoading || isCoverLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            {currentPage === 0 ? (
              // Cover Page
              <BookCover 
                coverData={coverData} 
                authorName={authorName}
              />
            ) : (
              // Content Pages
              currentStoryInfo && currentStoryInfo.story && (
                <PageView 
                  story={currentStoryInfo.story} 
                  pageNumber={currentStoryInfo.pageWithinStory || 1}
                  totalPagesInStory={currentStoryInfo.totalPagesInStory || 1}
                  isMediaPage={currentStoryInfo.isMediaPage}
                  mediaItem={currentStoryInfo.mediaItem}
                  isMobile={isMobile}
                  globalPageNumber={currentPage}
                  bookTitle={bookTitle}
                />
              )
            )}
          </>
        )}

        {/* Page Turn Buttons */}
        <BookPreviewControls
          currentPage={currentPage}
          totalPageCount={totalPageCount}
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default BookPreviewContent;
