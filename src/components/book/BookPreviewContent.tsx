
import { useRef, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
import { Story } from "@/types/supabase";
import { CoverData } from "@/components/cover/CoverTypes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface BookPreviewContentProps {
  currentPage: number;
  zoomLevel: number;
  coverData: CoverData;
  authorName: string;
  stories: Story[] | undefined;
  isLoading: boolean;
  storyPages: number[];
  getCurrentStoryIndex: () => number;
  getPageWithinStory: () => number;
}

const BookPreviewContent = ({
  currentPage,
  zoomLevel,
  coverData,
  authorName,
  stories,
  isLoading,
  storyPages,
  getCurrentStoryIndex,
  getPageWithinStory,
}: BookPreviewContentProps) => {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [prevPage, setPrevPage] = useState(currentPage);
  
  const currentStoryIndex = getCurrentStoryIndex();
  const currentStory = currentStoryIndex !== -1 ? stories?.[currentStoryIndex] : null;

  // Handle page transition animation
  useEffect(() => {
    if (prevPage !== currentPage) {
      // Only show transition if not the initial load
      if (prevPage !== 0 || currentPage !== 0) {
        setPageTransitioning(true);
        
        const timer = setTimeout(() => {
          setPageTransitioning(false);
        }, 400); // Slightly longer than animation duration
        
        return () => clearTimeout(timer);
      }
    }
    
    setPrevPage(currentPage);
  }, [currentPage, prevPage]);

  // Page dimensions for a 5x8 inch book (at 96 DPI)
  const PAGE_WIDTH = 480;  // 5 inches * 96dpi = 480px
  const PAGE_HEIGHT = 768; // 8 inches * 96dpi = 768px

  // Determine if this is the last page for the current story
  const isLastPageForStory = 
    currentStoryIndex < (stories?.length || 0) - 1 && 
    currentPage === storyPages[currentStoryIndex + 1] - 1;

  return (
    <div 
      className="flex-1 h-full flex flex-col items-center justify-center p-4 overflow-hidden"
      ref={bookContainerRef}
    >
      <div 
        className="relative bg-white shadow-xl rounded-md transition-transform"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          width: `${PAGE_WIDTH}px`,
          height: `${PAGE_HEIGHT}px`,
          maxHeight: '90vh',
        }}
      >
        {(isLoading || pageTransitioning) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 transition-opacity duration-300">
            <LoadingSpinner className="h-10 w-10 text-primary" />
          </div>
        )}
        
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            {currentPage === 0 ? (
              <BookCover 
                coverData={coverData} 
                authorName={authorName}
              />
            ) : (
              currentStory && (
                <PageView 
                  story={currentStory} 
                  pageNumber={getPageWithinStory()}
                  isLastPage={isLastPageForStory}
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
