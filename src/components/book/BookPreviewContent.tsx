
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
  // Calculate dimensions based on device while maintaining aspect ratio
  const maxWidth = isMobile ? "90%" : "600px";
  const maxHeight = isMobile ? "75vh" : "90vh";
  
  // Get book title from cover data
  const bookTitle = coverData?.title || "My Book";

  return (
    <div 
      className="relative bg-white shadow-xl rounded-md transition-transform mx-auto overflow-hidden book-format"
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        maxWidth,
        height: "auto",
        maxHeight,
        aspectRatio: "5/8"
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
  );
};

export default BookPreviewContent;
