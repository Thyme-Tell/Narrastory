
import { Pencil } from "lucide-react";
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
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-bold">{coverData.titleText || "My Stories"}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onOpenCoverEditor}
        >
          <Pencil className="h-4 w-4" />
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
