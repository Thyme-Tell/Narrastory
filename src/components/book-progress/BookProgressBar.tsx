
import { Progress } from "@/components/ui/progress";

interface BookProgressBarProps {
  currentPageCount: number;
  progressPercentage: number;
  minPagesRequired: number;
}

const BookProgressBar = ({ 
  currentPageCount, 
  progressPercentage, 
  minPagesRequired 
}: BookProgressBarProps) => {
  return (
    <div className="space-y-2 mt-4 w-[300px]">
      <p className="text-sm text-atlantic">
        Current Book Length: {currentPageCount} {currentPageCount === 1 ? 'page' : 'pages'}
      </p>
      <Progress value={progressPercentage} className="h-2" />
      {currentPageCount < minPagesRequired && (
        <p className="text-sm text-muted-foreground">
          Add {minPagesRequired - currentPageCount} more {(minPagesRequired - currentPageCount) === 1 ? 'page' : 'pages'} to reach the minimum for printing
        </p>
      )}
      {currentPageCount >= minPagesRequired && (
        <p className="text-sm text-[#155B4A]">
          ✓ Your book meets the minimum length requirement
        </p>
      )}
    </div>
  );
};

export default BookProgressBar;
