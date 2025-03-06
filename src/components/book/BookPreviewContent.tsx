
import { useRef, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
import { Story } from "@/types/supabase";
import { CoverData } from "@/components/cover/CoverTypes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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

  // For mobile, we'll use responsive dimensions
  const getPageDimensions = () => {
    if (isMobile) {
      // On mobile, use a responsive approach
      return {
        width: '100%',
        height: 'auto',
        maxHeight: '80vh',
        aspectRatio: '5/8'
      };
    }
    
    // On desktop, use fixed dimensions
    return {
      width: `${PAGE_WIDTH}px`,
      height: `${PAGE_HEIGHT}px`,
      maxHeight: '90vh'
    };
  };

  const pageDimensions = getPageDimensions();

  return (
    <div 
      className="flex-1 h-full flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden"
      ref={bookContainerRef}
    >
      <div 
        className="relative bg-white shadow-xl rounded-md transition-transform"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          ...pageDimensions,
          overflow: 'hidden'
        }}
      >
        {(isLoading || pageTransitioning) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 transition-opacity duration-300">
            <LoadingSpinner className="h-8 w-8 md:h-10 md:w-10 text-primary" />
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
                  isLastPage={currentStoryIndex < (stories?.length || 0) - 1 && currentPage === storyPages[currentStoryIndex + 1] - 1}
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
