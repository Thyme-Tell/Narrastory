
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCover from "./BookCover";
import PageView from "./PageView";
import { Story } from "@/types/supabase";
import { CoverData } from "@/components/cover/CoverTypes";

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
  
  const currentStoryIndex = getCurrentStoryIndex();
  const currentStory = currentStoryIndex !== -1 ? stories?.[currentStoryIndex] : null;

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
          width: '600px',  // Adjusted for 5x8 aspect ratio (5:8 = 600:960)
          height: '960px', // 5x8 inch ratio
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
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
