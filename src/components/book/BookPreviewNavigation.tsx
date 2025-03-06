
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookPreviewNavigationProps {
  currentPage: number;
  totalPageCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const BookPreviewNavigation = ({
  currentPage,
  totalPageCount,
  onPrevPage,
  onNextPage,
}: BookPreviewNavigationProps) => {
  return (
    <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onPrevPage}
        disabled={currentPage === 0}
        className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto ml-2"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onNextPage}
        disabled={currentPage === totalPageCount - 1}
        className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto mr-2"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default BookPreviewNavigation;
