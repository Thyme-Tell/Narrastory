
import React, { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContentProps {
  pageContent: string[];
  contentOverflows: boolean;
  isLastPage: boolean;
}

const PageContent = ({ pageContent, contentOverflows, isLastPage }: PageContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  return (
    <div 
      ref={contentRef}
      className="prose max-w-none book-text"
      style={{ fontSize: isMobile ? '16px' : '18.5px' }}
    >
      {pageContent.map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
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
