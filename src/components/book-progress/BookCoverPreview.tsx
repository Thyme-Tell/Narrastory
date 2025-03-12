
import CoverCanvas from "../cover/CoverCanvas";
import { CoverData } from "../cover/CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
}

const BookCoverPreview = ({ coverData, isLoading }: BookCoverPreviewProps) => {
  const isMobile = useIsMobile();
  // Reduce width by 50% and ensure proper sizing on mobile
  const previewWidth = isMobile ? "110px" : "150px"; // Fixed width for mobile instead of vw
  const maxWidth = previewWidth; // Use same fixed width
  
  // Calculate appropriate dimensions with 5:8 aspect ratio
  const width = isMobile ? 110 : 150;
  const height = Math.round(width * (8/5)); // Exact 5:8 aspect ratio
  const scale = 2; // Keep the scale factor for high resolution
  
  if (isLoading) {
    return (
      <div style={{ width: previewWidth, maxWidth }} className="mx-auto">
        <div className="w-full aspect-[5/8] bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div style={{ width: previewWidth }} className="mx-auto book-cover-container p-[10px]">
      <div className="w-full overflow-hidden rounded-lg relative book-cover aspect-[5/8]">
        {/* Left-side gradient */}
        <div className="absolute left-0 top-0 w-[10px] h-full bg-gradient-to-r from-gray-400/40 to-transparent z-10"></div>
        
        <CoverCanvas 
          coverData={coverData} 
          width={width}
          height={height}
          scale={scale}
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
