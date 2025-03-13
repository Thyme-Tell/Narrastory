
import { Button } from "@/components/ui/button";
import { CoverData } from "@/components/cover/CoverTypes";

interface BookProgressInfoProps {
  coverData: CoverData;
  profileFirstName?: string;
  profileLastName?: string;
  onOpenCoverEditor: () => void;
}

const BookProgressInfo = ({ 
  coverData, 
  profileFirstName, 
  profileLastName, 
  onOpenCoverEditor 
}: BookProgressInfoProps) => {
  return (
    <>
      <div className="hidden md:block mb-8">
        {/* Added space for desktop only */}
      </div>
      
      <h2 className="text-lg font-medium text-muted-foreground mb-2">Your Book</h2>
      
      <div className="mb-2">
        <h1 className="text-2xl md:text-[1.82rem] font-serif leading-[1.1]">
          {coverData.titleText || "My Stories"}
        </h1>
        <Button 
          variant="link" 
          className="h-auto p-0 text-[#A33D29] flex justify-start"
          onClick={onOpenCoverEditor}
          aria-label="Edit book title"
        >
          Edit
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-base text-muted-foreground">
          by {profileFirstName} {profileLastName}
        </p>
      </div>
    </>
  );
};

export default BookProgressInfo;
