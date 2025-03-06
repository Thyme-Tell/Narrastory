
import React, { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { estimateContentHeight } from "@/utils/bookPagination";

interface PageContentProps {
  pageContent: string[];
  contentOverflows: boolean;
  isLastPage: boolean;
}

const PageContent = ({ pageContent, contentOverflows, isLastPage }: PageContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Font size based on device
  const fontSize = isMobile ? 16 : 18.5;
  
  // Log warning if page content is empty
  useEffect(() => {
    if (!pageContent || pageContent.length === 0) {
      console.warn("Warning: Empty page content rendered in PageContent component");
    } else {
      // Estimate content height using our helper
      const containerWidth = contentRef.current?.offsetWidth || 400;
      const estimatedHeight = estimateContentHeight(pageContent, fontSize, 1.5, containerWidth);
      console.log("Estimated content height:", estimatedHeight, "px");
    }
  }, [pageContent, fontSize]);
  
  // Handle empty content case
  if (!pageContent || pageContent.length === 0) {
    return (
      <div 
        ref={contentRef}
        className="prose max-w-none book-text text-center text-gray-400 italic"
        style={{ fontSize: isMobile ? '16px' : '18.5px' }}
      >
        No content available for this page.
      </div>
    );
  }
  
  return (
    <div 
      ref={contentRef}
      className="prose max-w-none book-text"
      style={{ fontSize: isMobile ? '16px' : '18.5px' }}
    >
      {pageContent.map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph || " "}
        </p>
      ))}
      
      {/* If content overflows to next page, show indicator */}
      {contentOverflows && !isLastPage && (
        <div className="text-right text-sm text-gray-400 mt-4">
          Continued on next page...
        </div>
      )}
    </div>
  );
};

export default PageContent;
