
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bookmark, Download, Maximize, Minimize, X, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookPreviewHeaderProps {
  currentPage: number;
  totalPageCount: number;
  zoomLevel: number;
  bookmarks: number[];
  onClose: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleBookmark: () => void;
  onToggleToc: () => void;
  onDownloadPDF: () => void;
}

const BookPreviewHeader = ({
  currentPage,
  totalPageCount,
  zoomLevel,
  bookmarks,
  onClose,
  onZoomIn,
  onZoomOut,
  onToggleBookmark,
  onToggleToc,
  onDownloadPDF,
}: BookPreviewHeaderProps) => {
  const isMobile = useIsMobile();
  const progress = ((currentPage + 1) / totalPageCount) * 100;
  const isBookmarked = bookmarks.includes(currentPage);

  return (
    <div className="w-full px-4 py-3 bg-white border-b flex flex-col sm:flex-row justify-between items-center gap-2">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleToc}>
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 max-w-md">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span>Page {currentPage + 1} of {totalPageCount}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex items-center space-x-2">
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <Minimize className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              disabled={zoomLevel >= 2}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleBookmark}
          className={isBookmarked ? "text-primary" : ""}
        >
          <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownloadPDF}
          title="Download as PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BookPreviewHeader;
