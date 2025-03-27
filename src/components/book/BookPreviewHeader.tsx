
import React from "react";
import { 
  ChevronLeft, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  Bookmark, 
  Download, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
}

const BookPreviewHeader = ({
  totalPageCount,
  currentPage,
  zoomLevel,
  showToc,
  bookmarks = [],
  onToggleToc,
  onZoomIn,
  onZoomOut,
  onToggleBookmark,
  onClose,
  isMobile = false,
  onDownloadPDF,
  isGeneratingPDF = false
}: BookPreviewHeaderProps) => {
  // Format zoom level as percentage
  const zoomPercentage = Math.round(zoomLevel * 100);
  const isCurrentPageBookmarked = bookmarks.includes(currentPage);
  
  return (
    <div className="bg-[#3C2A21] w-full py-2 px-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onClose} 
          variant="outline" 
          size="icon"
          className="rounded-full bg-white/10 hover:bg-white/20 border-transparent"
        >
          <ChevronLeft className="h-4 w-4 text-white" />
        </Button>
        
        <div className="text-white text-sm">
          Page {currentPage + 1} of {totalPageCount}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isMobile && (
          <>
            <Button
              onClick={onToggleToc}
              variant="outline"
              size="icon"
              className={`rounded-full ${showToc ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 border-transparent`}
            >
              <BookOpen className="h-4 w-4 text-white" />
            </Button>
            
            <Button
              onClick={onZoomOut}
              variant="outline"
              size="icon"
              disabled={zoomLevel <= 0.5}
              className="rounded-full bg-white/10 hover:bg-white/20 border-transparent"
            >
              <ZoomOut className="h-4 w-4 text-white" />
            </Button>
            
            <div className="text-white text-xs w-12 text-center">
              {zoomPercentage}%
            </div>
            
            <Button
              onClick={onZoomIn}
              variant="outline"
              size="icon"
              disabled={zoomLevel >= 2}
              className="rounded-full bg-white/10 hover:bg-white/20 border-transparent"
            >
              <ZoomIn className="h-4 w-4 text-white" />
            </Button>
          </>
        )}
        
        <Button
          onClick={onToggleBookmark}
          variant="outline"
          size="icon"
          className={`rounded-full ${isCurrentPageBookmarked ? 'bg-amber-400/70 hover:bg-amber-400/90' : 'bg-white/10 hover:bg-white/20'} border-transparent`}
        >
          <Bookmark className={`h-4 w-4 ${isCurrentPageBookmarked ? 'text-[#3C2A21]' : 'text-white'}`} />
        </Button>
        
        {onDownloadPDF && (
          <Tooltip content={isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}>
            <Button
              onClick={onDownloadPDF}
              variant="outline"
              size="icon"
              disabled={isGeneratingPDF}
              className="rounded-full bg-white/10 hover:bg-white/20 border-transparent relative"
            >
              {isGeneratingPDF ? (
                <LoadingSpinner className="h-4 w-4 text-white" />
              ) : (
                <Download className="h-4 w-4 text-white" />
              )}
            </Button>
          </Tooltip>
        )}
        
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 hover:bg-white/20 border-transparent lg:hidden"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default BookPreviewHeader;
