
import React from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookPreviewControlsProps {
  currentPage: number;
  totalPageCount: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  onDownloadPDF?: () => void;
  isMobile?: boolean;
}

const BookPreviewControls = ({
  currentPage,
  totalPageCount,
  goToNextPage,
  goToPrevPage,
  onDownloadPDF,
  isMobile = false,
}: BookPreviewControlsProps) => {
  const buttonSize = isMobile ? "h-10 w-10" : "h-14 w-14"; // Increased from h-8/h-12 to h-10/h-14
  const iconSize = isMobile ? "h-6 w-6" : "h-8 w-8"; // Increased from h-4/h-6 to h-6/h-8
  const marginClass = isMobile ? "mx-2" : "mx-3"; // Increased margins slightly

  return (
    <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPrevPage}
        disabled={currentPage === 0}
        className={`${buttonSize} rounded-full bg-background/80 pointer-events-auto ${marginClass}`}
      >
        <ChevronLeft className={iconSize} />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {onDownloadPDF && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownloadPDF}
          className={`${buttonSize} rounded-full bg-background/80 pointer-events-auto absolute bottom-4 right-1/2 transform translate-x-1/2`}
          title="Download PDF"
        >
          <Download className={iconSize} />
          <span className="sr-only">Download PDF</span>
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextPage}
        disabled={currentPage === totalPageCount - 1}
        className={`${buttonSize} rounded-full bg-background/80 pointer-events-auto ${marginClass}`}
      >
        <ChevronRight className={iconSize} />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
};

export default BookPreviewControls;
