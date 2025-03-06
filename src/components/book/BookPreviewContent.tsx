
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
  // Calculate dimensions based on device
  const width = isMobile ? "100%" : "600px";
  const height = isMobile ? "auto" : "960px";
  const maxHeight = isMobile ? "80vh" : "90vh";

  return (
    <div 
      className="relative bg-white shadow-xl rounded-md transition-transform"
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        width,
        height,
        maxHeight,
        aspectRatio: isMobile ? "5/8" : "auto" // Maintain aspect ratio on mobile
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
