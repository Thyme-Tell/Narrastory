
import React from "react";

interface PageContentProps {
  pageContent: string[];
  contentOverflows: boolean;
  isLastPage: boolean;
}

const PageContent = ({ pageContent, contentOverflows, isLastPage }: PageContentProps) => {
  if (!pageContent || pageContent.length === 0) {
    // Instead of showing a blank page message, we'll just return null
    // This helps PageView handle the empty page case
    return null;
  }
  
  return (
    <div className="prose max-w-none book-text">
      {pageContent.map((paragraph, index) => (
        <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
      ))}
      
      {contentOverflows && !isLastPage && (
        <div className="text-right text-sm text-gray-400 mt-4 continuation-indicator">
          Continued on next page...
        </div>
      )}
    </div>
  );
};

export default PageContent;
