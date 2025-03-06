
import React from "react";
import { Story } from "@/types/supabase";
import { calculateStoryPages } from "@/utils/bookPagination";
import { Bookmark, FileImage, FileText } from "lucide-react";
import { StoryMediaItem } from "@/types/media";

interface TableOfContentsProps {
  stories: Story[];
  currentPage: number;
  onSelectPage: (pageIndex: number) => void;
  bookmarks: number[];
  storyPages: number[];
  storyMediaMap?: Map<string, StoryMediaItem[]>;
}

const TableOfContents = ({
  stories,
  currentPage,
  onSelectPage,
  bookmarks,
  storyPages,
  storyMediaMap = new Map()
}: TableOfContentsProps) => {
  if (stories.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
      
      {/* Cover */}
      <div 
        className={`p-2 mb-2 rounded cursor-pointer ${currentPage === 0 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        onClick={() => onSelectPage(0)}
      >
        <span>Cover</span>
      </div>

      {/* Stories */}
      {stories.map((story, index) => {
        const startPage = storyPages[index];
        const storyTextPages = calculateStoryPages(story);
        const mediaItems = storyMediaMap.get(story.id) || [];
        
        return (
          <div key={story.id} className="mb-4">
            <div 
              className={`p-2 mb-1 rounded cursor-pointer ${currentPage === startPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              onClick={() => onSelectPage(startPage)}
            >
              <span className="font-medium">{story.title || "Untitled Story"}</span>
            </div>
            
            {/* Text pages */}
            <div className="ml-4 space-y-1 mb-2">
              {Array.from({ length: storyTextPages }).map((_, i) => {
                const pageIndex = startPage + i;
                const isBookmarked = bookmarks.includes(pageIndex);
                
                return (
                  <div 
                    key={`text-${i}`}
                    className={`flex items-center p-1 rounded cursor-pointer ${currentPage === pageIndex ? 'bg-muted' : 'hover:bg-accent/50'}`}
                    onClick={() => onSelectPage(pageIndex)}
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    <span className="text-sm">Page {i + 1}</span>
                    {isBookmarked && <Bookmark className="h-3 w-3 ml-auto text-amber-500" />}
                  </div>
                );
              })}
            </div>
            
            {/* Media pages */}
            {mediaItems.length > 0 && (
              <div className="ml-4 space-y-1">
                {mediaItems.map((mediaItem, i) => {
                  const pageIndex = startPage + storyTextPages + i;
                  const isBookmarked = bookmarks.includes(pageIndex);
                  
                  return (
                    <div 
                      key={`media-${mediaItem.id}`}
                      className={`flex items-center p-1 rounded cursor-pointer ${currentPage === pageIndex ? 'bg-muted' : 'hover:bg-accent/50'}`}
                      onClick={() => onSelectPage(pageIndex)}
                    >
                      <FileImage className="h-3 w-3 mr-2" />
                      <span className="text-sm">
                        {mediaItem.caption ? mediaItem.caption : `Image ${i + 1}`}
                      </span>
                      {isBookmarked && <Bookmark className="h-3 w-3 ml-auto text-amber-500" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Bookmarks section */}
      {bookmarks.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Bookmarks</h4>
          <div className="space-y-1">
            {bookmarks.map((pageIndex) => (
              <div 
                key={`bookmark-${pageIndex}`}
                className={`flex items-center p-1 rounded cursor-pointer ${currentPage === pageIndex ? 'bg-muted' : 'hover:bg-accent/50'}`}
                onClick={() => onSelectPage(pageIndex)}
              >
                <Bookmark className="h-3 w-3 mr-2 text-amber-500" />
                <span className="text-sm">
                  {pageIndex === 0 
                    ? "Cover" 
                    : `Page ${pageIndex}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;
