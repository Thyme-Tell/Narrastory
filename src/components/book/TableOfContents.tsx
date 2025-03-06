
import React from "react";
import { Story } from "@/types/supabase";
import { Bookmark, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateStoryPages } from "@/utils/bookPagination";

interface TableOfContentsProps {
  stories: Story[];
  currentPage: number;
  onSelectPage: (pageIndex: number) => void;
  bookmarks: number[];
  storyPages: number[]; // Added this prop
}

const TableOfContents = ({ 
  stories, 
  currentPage, 
  onSelectPage, 
  bookmarks,
  storyPages 
}: TableOfContentsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Table of Contents</h3>
      
      {/* Cover */}
      <div 
        className={cn(
          "flex items-center p-2 rounded hover:bg-accent cursor-pointer transition-colors",
          currentPage === 0 && "bg-accent"
        )}
        onClick={() => onSelectPage(0)}
      >
        <FileText className="h-4 w-4 mr-2" />
        <span>Cover</span>
        {bookmarks.includes(0) && (
          <Bookmark className="h-4 w-4 ml-auto text-amber-500" />
        )}
      </div>

      {/* Stories */}
      {stories.map((story, index) => {
        const pageCount = calculateStoryPages(story);
        const startPage = storyPages[index];
        
        return (
          <div key={story.id} className="mb-2">
            <div 
              className={cn(
                "flex flex-col p-2 rounded hover:bg-accent cursor-pointer transition-colors",
                (currentPage >= startPage && currentPage < startPage + pageCount) && "bg-accent/50"
              )}
              onClick={() => onSelectPage(startPage)}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="flex-1 truncate">{story.title || "Untitled Story"}</span>
                {bookmarks.some(b => b >= startPage && b < startPage + pageCount) && (
                  <Bookmark className="h-4 w-4 ml-1 text-amber-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-6">
                {format(new Date(story.created_at), "MMM d, yyyy")} 
                {pageCount > 1 && ` • ${pageCount} pages`}
              </span>
            </div>
            
            {/* Show individual pages if story has multiple pages */}
            {pageCount > 1 && (
              <div className="ml-6 mt-1 space-y-1">
                {Array.from({ length: pageCount }).map((_, pageIdx) => (
                  <div
                    key={`${story.id}-page-${pageIdx}`}
                    className={cn(
                      "flex items-center p-1 text-sm rounded hover:bg-accent/80 cursor-pointer transition-colors",
                      currentPage === startPage + pageIdx && "bg-accent"
                    )}
                    onClick={() => onSelectPage(startPage + pageIdx)}
                  >
                    <span className="ml-6">Page {pageIdx + 1}</span>
                    {bookmarks.includes(startPage + pageIdx) && (
                      <Bookmark className="h-3 w-3 ml-auto text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Bookmarks section */}
      {bookmarks.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-2">Bookmarks</h3>
          <div className="space-y-2">
            {bookmarks.map((pageIndex) => {
              // Find which story this bookmark belongs to
              let storyInfo = -1;
              
              if (pageIndex === 0) {
                // Cover page
                storyInfo = -1;
              } else if (stories.length && storyPages.length) {
                // Find which story this page belongs to
                storyInfo = stories.findIndex((_, idx) => {
                  const nextIdx = idx + 1;
                  const nextPage = nextIdx < storyPages.length ? storyPages[nextIdx] : Number.MAX_SAFE_INTEGER;
                  return pageIndex >= storyPages[idx] && pageIndex < nextPage;
                });
              }
              
              // Determine the title based on storyInfo
              let storyTitle = "Unknown";
              if (pageIndex === 0) {
                storyTitle = "Cover";
              } else if (storyInfo !== -1 && storyInfo >= 0 && storyInfo < stories.length) {
                storyTitle = stories[storyInfo]?.title || "Untitled Story";
              }
              
              // If it's a story page, calculate which page within the story
              let pageText = "";
              if (pageIndex > 0 && storyInfo !== -1 && storyInfo >= 0) {
                const pageWithinStory = pageIndex - storyPages[storyInfo] + 1;
                pageText = ` (Page ${pageWithinStory})`;
              }
              
              return (
                <div 
                  key={`bookmark-${pageIndex}`}
                  className="flex items-center p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onSelectPage(pageIndex)}
                >
                  <Bookmark className="h-4 w-4 mr-2 text-amber-500" />
                  <span>
                    {storyTitle}{pageText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;
