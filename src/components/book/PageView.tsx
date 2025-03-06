
import React, { useEffect, useRef, useState } from "react";
import { Story } from "@/types/supabase";
import PageHeader from "./PageHeader";
import PageContent from "./PageContent";
import PageMedia from "./PageMedia";
import { useStoryPageMedia } from "@/hooks/useStoryPageMedia";
import { 
  calculatePageContent, 
  checkContentOverflow, 
  isLastPageOfStory,
  getTotalPageCount
} from "@/utils/bookPagination";

interface PageViewProps {
  story: Story;
  pageNumber: number;
  isLastPage?: boolean;
}

const PageView = ({ story, pageNumber, isLastPage = false }: PageViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [pageCapacity, setPageCapacity] = useState(0);
  const [contentOverflows, setContentOverflows] = useState(false);

  const { mediaItems, isMediaLoading } = useStoryPageMedia(story.id);
  const hasImages = !isMediaLoading && mediaItems && mediaItems.length > 0;

  // Parse story content into paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  
  // Define constants for content pagination
  const PAGINATION_CONFIG = {
    charsPerPage: 1800, // Slightly conservative estimate
    titleSpace: 150,    // Approximate character equivalent of space taken by title and date
    imageSpace: 300     // Approximate character equivalent of space taken by an image
  };
  
  // Calculate content for this specific page
  const pageContent = calculatePageContent(paragraphs, pageNumber, PAGINATION_CONFIG, hasImages);
  
  // Check if this is the last page of this story
  const isStoryLastPage = isLastPageOfStory(paragraphs, pageNumber, PAGINATION_CONFIG, hasImages);

  // Show media only on first page
  const showMedia = pageNumber === 1 && hasImages;

  // After component mounts, measure the actual content height
  useEffect(() => {
    if (contentRef.current) {
      // Get the content height
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      
      // Get the available page height (accounting for padding)
      // For a 5x8 inch book at standard DPI, height is about 768px (8 inches * 96dpi)
      const pageHeight = 768 - 64; // 64px for padding (32px top + 32px bottom)
      setPageCapacity(pageHeight);
      
      // Determine if content overflows
      setContentOverflows(checkContentOverflow(height, pageHeight));
    }
  }, [pageContent, mediaItems, pageNumber]);

  // Handlers for media operations
  const handleImageClick = (url: string) => {
    console.log("Image clicked:", url);
  };

  const handleCaptionUpdate = (mediaId: string, caption: string) => {
    console.log("Caption update:", mediaId, caption);
  };

  const handleStartCrop = (url: string, mediaId: string) => {
    console.log("Start crop:", url, mediaId);
  };

  return (
    <div className="w-full h-full book-page flex flex-col p-8 bg-white">
      <div 
        ref={contentRef}
        className="w-full mx-auto book-content flex-1"
      >
        {pageNumber === 1 && (
          <PageHeader story={story} pageNumber={pageNumber} />
        )}

        <PageContent 
          pageContent={pageContent}
          contentOverflows={contentOverflows}
          isLastPage={isStoryLastPage || isLastPage} 
        />
        
        {showMedia && (
          <PageMedia 
            mediaItems={mediaItems}
            isMediaLoading={isMediaLoading}
            handleImageClick={handleImageClick}
            handleCaptionUpdate={handleCaptionUpdate}
            handleStartCrop={handleStartCrop}
          />
        )}
      </div>
    </div>
  );
};

export default PageView;
