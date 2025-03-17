
import React from "react";
import BookPreviewContent from "./BookPreviewContent";
import { CoverData } from "@/components/cover/CoverTypes";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";

interface BookPreviewContainerProps {
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
  isIOSDevice?: boolean;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
  bookmarks?: number[];
  storyPages?: number[];
  storyMediaMap?: Map<string, StoryMediaItem[]>;
  jumpToPage?: (page: number) => void;
  setShowToc?: (show: boolean) => void;
  showToc?: boolean;
  onClose?: () => void;
}

const BookPreviewContainer = ({
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
  isIOSDevice = false,
  onDownloadPDF,
  isGeneratingPDF = false,
  bookmarks = [],
  storyPages = [],
  storyMediaMap = new Map(),
  jumpToPage = () => {},
  setShowToc,
  showToc,
  onClose
}: BookPreviewContainerProps) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 pb-8">
      <BookPreviewContent
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        zoomLevel={zoomLevel}
        stories={stories || []}
        isStoriesLoading={isStoriesLoading || isGeneratingPDF}
        isCoverLoading={isCoverLoading}
        coverData={coverData}
        authorName={authorName}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
        currentStoryInfo={currentStoryInfo}
        isMobile={isMobile}
        onDownloadPDF={onDownloadPDF}
        bookmarks={bookmarks}
        storyPages={storyPages}
        storyMediaMap={storyMediaMap}
        jumpToPage={jumpToPage}
        setShowToc={setShowToc}
        showToc={showToc}
        onClose={onClose}
      />
    </div>
  );
}

export default BookPreviewContainer;
