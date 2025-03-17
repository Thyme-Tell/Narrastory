
import React from "react";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookPaginationProps {
  currentPage: number;
  totalPageCount: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  isMobile?: boolean;
}

const BookPagination = ({
  currentPage,
  totalPageCount,
  goToNextPage,
  goToPrevPage,
  isMobile = false,
}: BookPaginationProps) => {
  // Adjust text size based on mobile
  const textSize = isMobile ? "text-sm" : "text-base";
  const iconSize = isMobile ? "h-3 w-3" : "h-4 w-4";
  const buttonPadding = isMobile ? "py-2 px-3" : "py-3 px-5";
  
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPageCount - 1;

  return (
    <div className={cn(
      "grid grid-cols-3 gap-3 w-full max-w-xl mx-auto px-4",
      isMobile && "gap-2"
    )}>
      {/* Back Button */}
      <button
        onClick={goToPrevPage}
        disabled={isFirstPage}
        className={cn(
          "flex items-center justify-center",
          buttonPadding,
          textSize,
          "bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#333333]",
          "border border-[#E5E5E5] rounded-lg transition-colors",
          "font-medium",
          isFirstPage && "opacity-50 cursor-not-allowed"
        )}
      >
        Back
      </button>
      
      {/* Page Indicator */}
      <div
        className={cn(
          "flex items-center justify-center",
          buttonPadding,
          textSize,
          "bg-[#1F2937] text-white",
          "rounded-lg",
          "font-medium"
        )}
      >
        Page {currentPage + 1} / {totalPageCount} <ChevronRight className={cn("ml-1", iconSize)} />
      </div>
      
      {/* Next Button */}
      <button
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "flex items-center justify-center",
          buttonPadding,
          textSize,
          "bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#333333]",
          "border border-[#E5E5E5] rounded-lg transition-colors",
          "font-medium",
          isLastPage && "opacity-50 cursor-not-allowed"
        )}
      >
        Next <ArrowUpRight className={cn("ml-1", iconSize)} />
      </button>
    </div>
  );
};

export default BookPagination;
