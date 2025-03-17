
import React, { useEffect, useState } from "react";
import { CoverData } from "@/components/cover/CoverTypes";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { Skeleton } from "@/components/ui/skeleton";
import PageView from "./PageView";
import MediaPageView from "./MediaPageView";
import TableOfContentsPage from "./TableOfContentsPage";
import BookCover from "./BookCover";
import NavigationBar from "@/components/ui/navigation-bar";
import { useToast } from "@/hooks/use-toast";

interface BookPreviewContentProps {
  currentPage: number;
  totalPageCount: number;
  zoomLevel: number;
  stories: Story[];
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
  bookmarks?: number[];
  storyPages?: number[];
  storyMediaMap?: Map<string, StoryMediaItem[]>;
  jumpToPage?: (page: number) => void;
  setShowToc?: (show: boolean) => void;
  showToc?: boolean;
  onClose?: () => void;
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
  bookmarks = [],
  storyPages = [],
  storyMediaMap = new Map(),
  jumpToPage,
  setShowToc,
  showToc,
  onClose
}: BookPreviewContentProps) => {
  const { toast } = useToast();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [pageShownIndicator, setPageShownIndicator] = useState<number[]>([]);
  
  // Show scroll indicator when a new page is shown
  useEffect(() => {
    if (!pageShownIndicator.includes(currentPage)) {
      setShowScrollIndicator(true);
      setPageShownIndicator(prev => [...prev, currentPage]);
      
      // Hide indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowScrollIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, pageShownIndicator]);

  if (isStoriesLoading || isCoverLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="w-full max-w-xs aspect-[5/8]" />
      </div>
    );
  }

  const renderPageContent = () => {
    // Cover page (page 1)
    if (currentPage === 1) {
      return (
        <BookCover
          coverData={coverData}
          authorName={authorName}
        />
      );
    }
    
    // Table of Contents (page 2)
    if (currentPage === 2) {
      return (
        <TableOfContentsPage
          stories={stories}
          storyPages={storyPages}
          jumpToPage={jumpToPage}
        />
      );
    }
    
    // Regular story content
    if (currentStoryInfo) {
      const { story, isMediaPage, mediaItem, pageWithinStory, totalPagesInStory } = currentStoryInfo;
      
      // Show media page
      if (isMediaPage && mediaItem) {
        return (
          <MediaPageView
            story={story}
            mediaItem={mediaItem}
            globalPageNumber={currentPage}
            bookTitle={coverData.title || ""}
            totalPageCount={totalPageCount}
          />
        );
      }
      
      // Regular text page
      if (story) {
        return (
          <PageView
            story={story}
            pageNumber={pageWithinStory || 0}
            totalPagesInStory={totalPagesInStory || 0}
            globalPageNumber={currentPage}
            bookTitle={coverData.title || ""}
            totalPageCount={totalPageCount}
          />
        );
      }
    }
    
    return (
      <div className="flex items-center justify-center h-full">
        <p>No content available for this page.</p>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between">
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className="book-page book-page-background relative overflow-y-auto"
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.2s ease-out",
          }}
        >
          {renderPageContent()}
          
          {/* Scroll indicator */}
          {showScrollIndicator && (
            <div className="scroll-indicator-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 78 39"
                fill="none"
                className="scroll-down-icon"
              >
                <path
                  d="M3 3L39 35L75 3"
                  stroke="#333"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Bar at the bottom */}
      <div className="w-full flex justify-center mt-6">
        <NavigationBar
          leftButtonText="Previous"
          centerButtonText={`Page ${currentPage} of ${totalPageCount}`}
          rightButtonText="Next"
          onLeftButtonClick={goToPrevPage}
          onCenterButtonClick={() => {
            if (setShowToc) {
              setShowToc(!showToc);
            }
          }}
          onRightButtonClick={goToNextPage}
        />
      </div>
    </div>
  );
};

export default BookPreviewContent;
