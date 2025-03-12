
import CoverCanvas from "../cover/CoverCanvas";
import { CoverData } from "../cover/CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
}

const BookCoverPreview = ({ coverData, isLoading }: BookCoverPreviewProps) => {
  const isMobile = useIsMobile();
  const width = isMobile ? 110 : 150;
  const height = Math.round(width * (8/5));
  const scale = 2;
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center p-[10px]">
        <div className="w-[150px] aspect-[5/8] bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center p-[10px]">
      <div className="w-[150px] overflow-hidden rounded-lg relative aspect-[5/8] bg-white">
        <div className="absolute left-0 top-0 w-[10px] h-full bg-gradient-to-r from-gray-400/40 to-transparent z-10" />
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
