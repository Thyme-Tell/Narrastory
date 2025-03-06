
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
  const buttonSize = isMobile ? "h-8 w-8" : "h-12 w-12";
  const iconSize = isMobile ? "h-4 w-4" : "h-6 w-6";
  const marginClass = isMobile ? "mx-1" : "mx-2";

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
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextPage}
        disabled={currentPage === totalPageCount - 1}
        className={`${buttonSize} rounded-full bg-background/80 pointer-events-auto ${marginClass}`}
      >
        <ChevronRight className={iconSize} />
      </Button>
    </div>
  );
};

export default BookPreviewControls;
