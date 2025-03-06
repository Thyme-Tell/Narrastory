
import React from "react";
import { Book, ZoomIn, ZoomOut, Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookPreviewHeaderProps {
  totalPageCount: number;
  currentPage: number;
  zoomLevel: number;
  showToc: boolean;
  bookmarks: number[];
  onToggleToc: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
}

const BookPreviewHeader = ({
  totalPageCount,
  currentPage,
  zoomLevel,
  showToc,
  bookmarks,
  onToggleToc,
  onZoomIn,
  onZoomOut,
  onToggleBookmark,
  onClose,
}: BookPreviewHeaderProps) => {
  return (
    <div className="w-full bg-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleToc}
        >
          <Book className="h-4 w-4 mr-2" />
          Table of Contents
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleBookmark}
          className={cn(
            bookmarks.includes(currentPage) && "text-amber-500"
          )}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          {bookmarks.includes(currentPage) ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm">
          Page {currentPage + 1} of {totalPageCount}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default BookPreviewHeader;
