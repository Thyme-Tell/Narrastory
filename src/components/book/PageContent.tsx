
import React from "react";

interface PageContentProps {
  pageContent: string[];
  contentOverflows: boolean;
  isLastPage: boolean;
}

const PageContent = ({ pageContent, contentOverflows, isLastPage }: PageContentProps) => {
  if (!pageContent || pageContent.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 italic">This page is intentionally left blank.</p>
      </div>
    );
  }
  
  return (
    <div className="prose max-w-none book-text">
      {pageContent.map((paragraph, index) => (
        <p key={index} className="mb-4">{paragraph}</p>
      ))}
      
      {contentOverflows && !isLastPage && (
        <div className="text-right text-sm text-gray-400 mt-4">
          Continued on next page...
        </div>
      )}
    </div>
  );
};

export default PageContent;
