
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
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
  isIOSDevice?: boolean;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
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
}: BookPreviewContainerProps) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
      <BookPreviewContent
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        zoomLevel={zoomLevel}
        stories={stories}
        isStoriesLoading={isStoriesLoading || isGeneratingPDF}
        isCoverLoading={isCoverLoading}
        coverData={coverData}
        authorName={authorName}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
        currentStoryInfo={currentStoryInfo}
        isMobile={isMobile}
        onDownloadPDF={onDownloadPDF}
      />
    </div>
  );
}

export default BookPreviewContainer;
