
import React, { useRef, useEffect } from "react";
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
  jumpToPage = () => {}
}: BookPreviewContainerProps) => {
  const isMobile = window.innerWidth < 768;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Effect to capture exact styling for PDF matching
  useEffect(() => {
    if (containerRef.current) {
      // Store the current styling to use for PDF generation
      const computedStyle = window.getComputedStyle(containerRef.current);
      
      // This allows us to access the exact styling being rendered
      if (!window.bookPreviewStyles) {
        window.bookPreviewStyles = {};
      }
      
      // Save key style elements that need to be matched in the PDF
      window.bookPreviewStyles = {
        backgroundColor: computedStyle.backgroundColor,
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        textIndent: getTextIndentFromPage(),
        dropCapColor: getDropCapColorFromPage(),
        titleColor: "#3C2A21", // Book title color
        pageWidth: containerRef.current.offsetWidth,
        pageHeight: containerRef.current.offsetHeight,
        aspectRatio: "5/8"
      };
    }
  }, [currentPage, zoomLevel]);
  
  // Helper function to get text-indent from paragraphs
  const getTextIndentFromPage = () => {
    const paragraphs = document.querySelectorAll('.book-page p');
    if (paragraphs.length > 0) {
      const style = window.getComputedStyle(paragraphs[0]);
      return style.textIndent;
    }
    return "1.5em"; // Default if not found
  };
  
  // Helper function to get drop cap color
  const getDropCapColorFromPage = () => {
    const dropCap = document.querySelector('.drop-cap:first-letter');
    if (dropCap) {
      const style = window.getComputedStyle(dropCap as Element);
      return style.color;
    }
    return "#A33D29"; // Default color
  };

  return (
    <div 
      className="flex-1 overflow-hidden flex items-center justify-center p-4"
      ref={containerRef}
    >
      <BookPreviewContent
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        zoomLevel={zoomLevel}
        stories={stories || []}
        isStoriesLoading={isStoriesLoading}
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
      />
    </div>
  );
}

// Add the window extension for TypeScript support
declare global {
  interface Window {
    bookPreviewStyles?: {
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
}

export default BookPreviewContainer;
