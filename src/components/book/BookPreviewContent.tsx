
import React, { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
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
  bookmarks?: number[];
  storyPages?: number[];
  storyMediaMap?: Map<string, StoryMediaItem[]>;
  jumpToPage?: (pageIndex: number) => void;
  onClose?: () => void;
  setShowToc?: (show: boolean) => void;
  showToc?: boolean;
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
  currentStoryInfo,
  isMobile = false,
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
    <div className="w-full h-full flex items-center justify-center">
      <div 
        className="relative shadow-xl rounded-md transition-transform mx-auto overflow-hidden book-format page-transition"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          aspectRatio: "5/8",
          maxHeight: "calc(100vh - 20px)", // Adjusted to maintain exact 10px margins
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
      </div>
    </div>
  );
};

export default BookPreviewContent;
