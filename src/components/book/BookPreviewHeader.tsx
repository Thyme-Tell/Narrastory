
import React from "react";
import { X, ZoomIn, ZoomOut, Menu, Bookmark } from "lucide-react";
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
  const buttonClass = cn(
    "h-8 w-8 rounded-full",
    isMobile ? "p-1.5" : "p-2"
  );
  
  const isCurrentPageBookmarked = bookmarks.includes(currentPage);

  return (
    <div className="bg-black/10 backdrop-blur-md w-full py-2 px-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleToc}
          className={buttonClass}
        >
          <Menu className="h-4 w-4 text-white" />
          <span className="sr-only">Toggle Table of Contents</span>
        </Button>
        
        <div className="text-white text-sm">
          Page {currentPage + 1} of {totalPageCount}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onZoomOut}
          className={buttonClass}
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="h-4 w-4 text-white" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onZoomIn}
          className={buttonClass}
          disabled={zoomLevel >= 2}
        >
          <ZoomIn className="h-4 w-4 text-white" />
          <span className="sr-only">Zoom In</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleBookmark}
          className={cn(buttonClass, isCurrentPageBookmarked && "text-amber-400")}
        >
          <Bookmark className={cn("h-4 w-4 text-white", isCurrentPageBookmarked && "fill-amber-400 text-amber-400")} />
          <span className="sr-only">Bookmark Page</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className={buttonClass}
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};

export default BookPreviewHeader;
