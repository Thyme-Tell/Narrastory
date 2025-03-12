
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookPreviewControlsProps {
  currentPage: number;
  totalPageCount: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  isMobile?: boolean;
}

const BookPreviewControls = ({
  currentPage,
  totalPageCount,
  goToNextPage,
  goToPrevPage,
  isMobile = false,
}: BookPreviewControlsProps) => {
  // Increased button and icon sizes for better visibility
  const buttonSize = isMobile ? "h-12 w-12" : "h-16 w-16";
  const iconSize = isMobile ? "h-8 w-8" : "h-10 w-10";
  const marginClass = isMobile ? "mx-3" : "mx-4";

  return (
    <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPrevPage}
        disabled={currentPage === 0}
        className={`${buttonSize} rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background/95 pointer-events-auto ${marginClass} transition-all duration-200`}
      >
        <ChevronLeft className={`${iconSize} text-primary`} />
        <span className="sr-only">Previous page</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextPage}
        disabled={currentPage === totalPageCount - 1}
        className={`${buttonSize} rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background/95 pointer-events-auto ${marginClass} transition-all duration-200`}
      >
        <ChevronRight className={`${iconSize} text-primary`} />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
};

export default BookPreviewControls;
