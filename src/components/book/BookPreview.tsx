
import { useRef } from "react";
import { useBookPreview } from "@/hooks/useBookPreview";
import { useCoverData } from "@/hooks/useCoverData";
import BookPreviewHeader from "./BookPreviewHeader";
import BookPreviewContent from "./BookPreviewContent";
import BookPreviewNavigation from "./BookPreviewNavigation";
import TableOfContents from "./TableOfContents";

interface BookPreviewProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
}

const BookPreview = ({ profileId, open, onClose }: BookPreviewProps) => {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId);
  
  const {
    currentPage,
    zoomLevel,
    showToc,
    bookmarks,
    storyPages,
    totalPageCount,
    stories,
    profile,
    isStoriesLoading,
    goToNextPage,
    goToPrevPage,
    getCurrentStoryIndex,
    getPageWithinStory,
    zoomIn,
    zoomOut,
    toggleBookmark,
    toggleToc,
    jumpToPage
  } = useBookPreview(profileId, open);

  if (!open) return null;

  const isLoading = isStoriesLoading || isCoverLoading;
  const authorName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-start overflow-hidden">
      <BookPreviewHeader 
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        zoomLevel={zoomLevel}
        bookmarks={bookmarks}
        onClose={onClose}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleBookmark={toggleBookmark}
        onToggleToc={toggleToc}
      />

      <div className="flex-1 w-full flex overflow-hidden">
        {showToc && (
          <div className="w-64 h-full bg-muted p-4 overflow-y-auto animate-slide-in-right">
            <TableOfContents 
              stories={stories || []} 
              currentPage={currentPage}
              onSelectPage={jumpToPage}
              bookmarks={bookmarks}
              storyPages={storyPages}
            />
          </div>
        )}

        <div className="relative flex-1 h-full overflow-hidden">
          <BookPreviewContent 
            currentPage={currentPage}
            zoomLevel={zoomLevel}
            coverData={coverData}
            authorName={authorName}
            stories={stories}
            isLoading={isLoading}
            storyPages={storyPages}
            getCurrentStoryIndex={getCurrentStoryIndex}
            getPageWithinStory={getPageWithinStory}
          />

          <BookPreviewNavigation 
            currentPage={currentPage}
            totalPageCount={totalPageCount}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
          />
        </div>
      </div>
    </div>
  );
};

export default BookPreview;
