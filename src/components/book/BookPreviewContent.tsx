
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
import BookPreviewControls from "./BookPreviewControls";
import TwoPageBookLayout from "./TwoPageBookLayout";
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
  jumpToPage: (page: number) => void;
  viewMode: "single" | "double";
  currentStoryInfo: {
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
  nextStoryInfo: {
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
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
  jumpToPage,
  viewMode,
  currentStoryInfo,
  nextStoryInfo,
}: BookPreviewContentProps) => {
  if (isStoriesLoading || isCoverLoading) {
    return (
      <div 
        className="relative bg-white shadow-xl rounded-md transition-transform book-container"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
        }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Two-page book layout
  if (viewMode === "double") {
    return (
      <div 
        className="relative transition-transform book-container"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
        }}
      >
        <TwoPageBookLayout
          currentPage={currentPage}
          totalPageCount={totalPageCount}
          coverData={coverData}
          authorName={authorName}
          currentStoryInfo={currentStoryInfo}
          nextStoryInfo={nextStoryInfo}
          onPageClick={jumpToPage}
        />
      </div>
    );
  }

  // Single page layout (original)
  return (
    <div 
      className="relative bg-white shadow-xl rounded-md transition-transform"
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        width: '600px',  // Adjusted for 5x8 aspect ratio (5:8 = 600:960)
        height: '960px', // 5x8 inch ratio
        maxHeight: '90vh'
      }}
    >
      {/* Book Pages */}
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
          />
        )
      )}

      {/* Page Turn Buttons */}
      <BookPreviewControls
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
      />
    </div>
  );
};

export default BookPreviewContent;
