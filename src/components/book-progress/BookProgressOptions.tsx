
import { Book, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface BookProgressOptionsProps {
  profileId: string;
  onEditCover: () => void;
}

const BookProgressOptions = ({ profileId, onEditCover }: BookProgressOptionsProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handlePreviewBook = () => {
    navigate(`/profile/${profileId}/book-preview`);
  };
  
  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        size={isMobile ? "default" : "lg"} 
        className={`${isMobile ? "w-full" : "w-[200px]"} justify-start`} 
        onClick={onEditCover}
      >
        <Book className="mr-2" size={isMobile ? 16 : 20} />
        <span className={isMobile ? "text-sm" : ""}>Edit Cover</span>
      </Button>
      <Button 
        variant="outline" 
        size={isMobile ? "default" : "lg"} 
        className={`${isMobile ? "w-full" : "w-[200px]"} justify-start`}
        onClick={handlePreviewBook}
      >
        <Eye className="mr-2" size={isMobile ? 16 : 20} />
        <span className={isMobile ? "text-sm" : ""}>Preview Book</span>
      </Button>
      <div className="relative">
        <Button 
          variant="outline" 
          size={isMobile ? "default" : "lg"} 
          className={`${isMobile ? "w-full" : "w-[200px]"} justify-start`}
          disabled
        >
          <ShoppingCart className="mr-2" size={isMobile ? 16 : 20} />
          <span className={isMobile ? "text-sm" : ""}>Order Book</span>
        </Button>
        <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2">
          <span className="text-xs bg-[#AF4623] text-white px-2 py-0.5 rounded-full">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default BookProgressOptions;
