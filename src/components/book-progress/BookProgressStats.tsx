
import { BookOpen, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Story } from "@/types/supabase";
import { calculateTotalPages } from "@/utils/bookPagination";

interface BookProgressStatsProps {
  stories: Story[];
  scrollToTableOfContents: () => void;
}

const BookProgressStats = ({ stories, scrollToTableOfContents }: BookProgressStatsProps) => {
  const currentPageCount = stories.length ? calculateTotalPages(stories) : 1;
  
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="grid grid-cols-1 md:flex md:flex-col md:space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0">
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2 text-[#155B4A]" />
            <span className="text-foreground font-medium">{currentPageCount}</span>&nbsp;<span>pages</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <ListOrdered className="h-4 w-4 mr-2 text-[#A33D29]" />
            <span className="text-foreground font-medium">{stories.length}</span>&nbsp;<span>stories</span>
            <Button 
              variant="link" 
              className="h-auto p-0 ml-2 text-[#A33D29]"
              onClick={scrollToTableOfContents}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProgressStats;
