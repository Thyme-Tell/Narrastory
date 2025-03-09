
import React from "react";
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
  // Calculate dimensions based on viewport and device
  const getContainerStyle = () => {
    // Base styles present in all cases
    const baseStyle = {
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'center',
      aspectRatio: "5/8",
      willChange: "transform", // Performance optimization for mobile
    };

    // Mobile specific adjustments
    if (isMobile) {
      return {
        ...baseStyle,
        maxWidth: "90vw",
        maxHeight: "70vh",
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
  );
};

export default BookPreviewContent;
