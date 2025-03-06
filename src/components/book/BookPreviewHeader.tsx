
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
  isMobile?: boolean;
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
  isMobile = false,
}: BookPreviewHeaderProps) => {
  return (
    <div className="w-full bg-white p-4 flex flex-wrap items-center justify-between gap-2">
      <div className={`flex ${isMobile ? 'flex-wrap' : ''} items-center gap-2`}>
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={onToggleToc}
          className={isMobile ? "p-2" : ""}
        >
          <Book className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Contents</span>}
        </Button>
        
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" onClick={onZoomOut} className={isMobile ? "h-8 w-8 p-1" : ""}>
            <ZoomOut className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <span className="text-xs sm:text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={onZoomIn} className={isMobile ? "h-8 w-8 p-1" : ""}>
            <ZoomIn className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={onToggleBookmark}
          className={cn(
            bookmarks.includes(currentPage) && "text-amber-500",
            isMobile ? "p-2" : ""
          )}
        >
          <Bookmark className="h-4 w-4" />
          {!isMobile && <span className="ml-2">{bookmarks.includes(currentPage) ? "Bookmarked" : "Bookmark"}</span>}
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {currentPage + 1}/{totalPageCount}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} className={isMobile ? "h-8 w-8 p-1" : ""}>
          <X className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
      </div>
    </div>
  );
};

export default BookPreviewHeader;
