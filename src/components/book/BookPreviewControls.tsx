
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookPreviewControlsProps {
  currentPage: number;
  totalPageCount: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const BookPreviewControls = ({
  currentPage,
  totalPageCount,
  goToNextPage,
  goToPrevPage,
}: BookPreviewControlsProps) => {
  return (
    <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPrevPage}
        disabled={currentPage === 0}
        className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto ml-2"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextPage}
        disabled={currentPage === totalPageCount - 1}
        className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto mr-2"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default BookPreviewControls;
