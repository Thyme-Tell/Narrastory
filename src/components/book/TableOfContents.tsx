
import React from "react";
import { Story } from "@/types/supabase";
import { Bookmark, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  stories: Story[];
  currentPage: number;
  onSelectPage: (pageIndex: number) => void;
  bookmarks: number[];
}

const TableOfContents = ({ 
  stories, 
  currentPage, 
  onSelectPage, 
  bookmarks 
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
      {stories.map((story, index) => (
        <div 
          key={story.id}
          className={cn(
            "flex flex-col p-2 rounded hover:bg-accent cursor-pointer transition-colors",
            currentPage === index + 1 && "bg-accent"
          )}
          onClick={() => onSelectPage(index + 1)}
        >
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="flex-1 truncate">{story.title || "Untitled Story"}</span>
            {bookmarks.includes(index + 1) && (
              <Bookmark className="h-4 w-4 ml-1 text-amber-500" />
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-6">
            {format(new Date(story.created_at), "MMM d, yyyy")}
          </span>
        </div>
      ))}

      {/* Bookmarks section */}
      {bookmarks.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-2">Bookmarks</h3>
          <div className="space-y-2">
            {bookmarks.map((pageIndex) => (
              <div 
                key={`bookmark-${pageIndex}`}
                className="flex items-center p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onSelectPage(pageIndex)}
              >
                <Bookmark className="h-4 w-4 mr-2 text-amber-500" />
                <span>
                  {pageIndex === 0 
                    ? "Cover" 
                    : stories[pageIndex - 1]?.title || "Untitled Story"}
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
