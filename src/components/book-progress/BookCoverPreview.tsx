
import CoverCanvas from "../cover/CoverCanvas";
import { CoverData } from "../cover/CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
}

const BookCoverPreview = ({ coverData, isLoading }: BookCoverPreviewProps) => {
  const isMobile = useIsMobile();
  const previewWidth = isMobile ? "50vw" : "300px";
  const maxWidth = isMobile ? "min(50vw, 220px)" : "300px";
  
  if (isLoading) {
    return (
      <div style={{ width: previewWidth, maxWidth }} className="mx-auto">
        <div className="w-full aspect-[5/8] bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div style={{ width: previewWidth, maxWidth }} className="mx-auto book-cover-container">
      <div className="overflow-hidden rounded-lg relative book-cover">
        {/* Left-side gradient */}
        <div className="absolute left-0 top-0 w-[10px] h-full bg-gradient-to-r from-gray-400/40 to-transparent z-10"></div>
        
        <CoverCanvas 
          coverData={coverData} 
          width={isMobile ? 200 : 300}
          height={isMobile ? 320 : 480}
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
