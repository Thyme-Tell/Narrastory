
import { Book, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookProgressOptionsProps {
  onEditCover: () => void;
  onPreviewBook: () => void;
}

const BookProgressOptions = ({ onEditCover, onPreviewBook }: BookProgressOptionsProps) => {
  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        size="lg" 
        className="w-[200px] justify-start" 
        onClick={onEditCover}
      >
        <Book className="mr-2" />
        Edit Cover
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        className="w-[200px] justify-start"
        onClick={onPreviewBook}
      >
        <Eye className="mr-2" />
        Preview Book
      </Button>
      <div className="relative">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-[200px] justify-start"
          disabled
        >
          <ShoppingCart className="mr-2" />
          Order Book
        </Button>
        <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2">
          <span className="text-xs bg-[#AF4623] text-white px-2 py-0.5 rounded-full">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default BookProgressOptions;
