
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
  // Reducing button sizes by 30%
  const buttonSize = isMobile ? "h-7 w-7" : "h-10 w-10"; // Reduced from h-10/h-14 to h-7/h-10
  const iconSize = isMobile ? "h-5 w-5" : "h-7 w-7"; // Reduced from h-8/h-10 to h-5/h-7
  const marginClass = isMobile ? "mx-1" : "mx-0";

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center pointer-events-none px-1 md:px-2 pb-1">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPrevPage}
        disabled={currentPage === 0}
        className={`${buttonSize} rounded-full bg-[#00000033] backdrop-blur-sm shadow-md hover:bg-[#00000055] pointer-events-auto ${marginClass} transition-all duration-200 absolute left-1 md:left-2 bottom-0`}
      >
        <ChevronLeft className={`${iconSize} text-primary`} />
        <span className="sr-only">Previous page</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextPage}
        disabled={currentPage === totalPageCount - 1}
        className={`${buttonSize} rounded-full bg-[#00000033] backdrop-blur-sm shadow-md hover:bg-[#00000055] pointer-events-auto ${marginClass} transition-all duration-200 absolute right-1 md:right-2 bottom-0`}
      >
        <ChevronRight className={`${iconSize} text-primary`} />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
};

export default BookPreviewControls;
