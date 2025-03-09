
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
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
  isMobile?: boolean;
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
}: BookPreviewContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect to handle rendering and scaling issues
  useEffect(() => {
    if (containerRef.current) {
      // Force repaint on iOS devices to fix rendering issues
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0.99';
          requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.style.opacity = '1';
            }
          });
        }
      }, 100);
    }
  }, [isMobile, currentPage]);
  
  // Get book title from cover data
  const bookTitle = coverData?.titleText || "My Book";

  // Log for debugging
  console.log("Rendering page:", currentPage, "Story info:", currentStoryInfo);

  return (
    <div 
      className="fixed-book-container"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        backgroundColor: "#f5f5f0",
        position: "relative",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        width: "400px",  // Fixed width for consistency
        height: "640px", // Fixed height (5:8 ratio)
        maxHeight: isMobile ? "80vh" : "90vh",
        margin: "0 auto",
        transition: "transform 0.2s ease-out",
        overflow: "hidden", // Prevent content overflow
        padding: "0", // Remove padding to maximize content area
      }}
      ref={containerRef}
      data-is-mobile={isMobile ? "true" : "false"}
      data-page-number={currentPage}
    >
      <div 
        ref={contentRef}
        className="book-content-wrapper"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          padding: "0", // Remove padding to maximize content area
        }}
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
                  pageNumber={currentStoryInfo.pageWithinStory}
                  totalPagesInStory={currentStoryInfo.totalPagesInStory}
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
