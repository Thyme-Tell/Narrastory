
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
  pageStyles?: {
    backgroundColor: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    textIndent: string;
    dropCapColor: string;
    titleColor: string;
    pageWidth: number;
    pageHeight: number;
    aspectRatio: string;
  };
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
  pageStyles = {
    backgroundColor: "#f5f5f0",
    fontFamily: "Libre Baskerville, serif",
    fontSize: "16px",
    lineHeight: "1.6",
    textIndent: "1.5em",
    dropCapColor: "#A33D29",
    titleColor: "#242F3F",
    pageWidth: 400,
    pageHeight: 600,
    aspectRatio: "2/3"
  }
}: BookPreviewContainerProps) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
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
        pageStyles={pageStyles}
      />
    </div>
  );
}

export default BookPreviewContainer;
