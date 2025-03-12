
import CoverCanvas from "../cover/CoverCanvas";
import { CoverData } from "../cover/CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
}

const BookCoverPreview = ({ coverData, isLoading }: BookCoverPreviewProps) => {
  const isMobile = useIsMobile();
  // Reduce width by 50%
  const previewWidth = isMobile ? "25vw" : "150px";
  const maxWidth = isMobile ? "min(25vw, 110px)" : "150px";
  
  // Calculate appropriate dimensions for high resolution
  const canvasWidth = isMobile ? 150 : 250;  // 50% of previous values
  const canvasHeight = isMobile ? 240 : 400; // Maintaining 5:8 aspect ratio
  const scale = 2; // Keep the scale factor for high resolution
  
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
          width={isMobile ? 150 : 150}  // 50% of previous values
          height={isMobile ? 240 : 240}
          scale={scale} // Keep the scale factor for high resolution
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
