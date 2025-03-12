
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
  bookmarks: number[];
  storyPages: number[];
  storyMediaMap: Map<string, StoryMediaItem[]>;
  jumpToPage: (pageIndex: number) => void;
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
  bookmarks,
  storyPages,
  storyMediaMap,
  jumpToPage
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
      
      console.log("BookPreviewContent mounted for mobile:", { isMobile, currentPage });
    }
  }, [isMobile, currentPage]);
  
  // Calculate dimensions based on viewport and device
  const getContainerStyle = () => {
    // Base styles present in all cases
    const baseStyle: React.CSSProperties = {
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'center',
      aspectRatio: "5/8",
      willChange: "transform", // Performance optimization
      backgroundColor: "#f5f5f0", // Ensure background is visible
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      opacity: 1, // Ensure visibility
    };

    // Mobile specific adjustments
    if (isMobile) {
      return {
        ...baseStyle,
        height: "70vh", // Fixed height to ensure visibility
        width: "85vw",    // Set width to be proportional
        maxWidth: "85vw", // Ensure it's not too wide
        margin: "0 auto",
        border: "1px solid rgba(0,0,0,0.1)", // Extra border to help with visibility
      };
    }

    // Desktop sizing
    return {
      ...baseStyle,
      maxWidth: "600px",
      maxHeight: "90vh",
    };
  };
  
  // Get book title from cover data
  const bookTitle = coverData?.titleText || "My Book";

  return (
    <div 
      className="relative bg-white shadow-xl rounded-md transition-transform mx-auto overflow-hidden book-format page-transition"
      style={getContainerStyle()}
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
  );
};

export default BookPreviewContent;
