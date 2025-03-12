
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
  
  // Calculate appropriate dimensions for high resolution
  const canvasWidth = isMobile ? 300 : 500;  // Higher base value
  const canvasHeight = isMobile ? 480 : 800; // Maintaining 5:8 aspect ratio
  const scale = 2; // Use a higher scale factor for better resolution
  
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
          width={isMobile ? 300 : 300}  // Keep display dimensions the same
          height={isMobile ? 480 : 480}
          scale={scale} // Apply the scale factor for higher resolution
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
