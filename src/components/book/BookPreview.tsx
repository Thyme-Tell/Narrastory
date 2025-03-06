
import { useRef } from "react";
import { useBookPreview } from "@/hooks/useBookPreview";
import { useCoverData } from "@/hooks/useCoverData";
import BookPreviewHeader from "./BookPreviewHeader";
import BookPreviewContent from "./BookPreviewContent";
import BookPreviewNavigation from "./BookPreviewNavigation";
import TableOfContents from "./TableOfContents";
import { generateBookPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface BookPreviewProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
}

const BookPreview = ({ profileId, open, onClose }: BookPreviewProps) => {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId);
  const { toast } = useToast();
  
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

  const handleDownloadPDF = async () => {
    if (isLoading || !stories || stories.length === 0) {
      toast({
        title: "Cannot generate PDF",
        description: "Please wait for content to load completely",
        variant: "destructive",
      });
      return;
    }

    await generateBookPDF(
      stories,
      coverData,
      authorName,
      storyPages,
      bookContainerRef
    );
  };

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
        onDownloadPDF={handleDownloadPDF}
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
            ref={bookContainerRef}
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
