
import { BookOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookProgressActionsProps {
  onPreviewBook: () => void;
  onOpenCoverEditor: () => void;
}

const BookProgressActions = ({ onPreviewBook, onOpenCoverEditor }: BookProgressActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={onPreviewBook}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Preview Book
        </Button>

        <Button
          variant="outline"
          onClick={onOpenCoverEditor}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Cover
        </Button>
      </div>

      <Button
        variant="secondary"
        className="w-full relative bg-[#b3b3b3] hover:bg-[#a6a6a6] text-[#4d4d4d]"
        disabled
      >
        <span className="inline-flex items-center">
          <span className="bg-[#AF4623] text-white text-xs px-2 py-0.5 rounded-full mr-2">
            Coming Soon
          </span>
          Order Book
        </span>
      </Button>
    </div>
  );
};

export default BookProgressActions;
