
import CoverCanvas from "../CoverCanvas";
import { CoverData } from "../CoverTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoverPreviewProps {
  coverData: CoverData;
  isLoading?: boolean;
}

const CoverPreview = ({ coverData, isLoading = false }: CoverPreviewProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
        <Skeleton className="w-full max-w-xs mx-auto aspect-[5/8]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      <div className="book-preview-container flex items-center justify-center h-full">
        <div 
          className="max-h-full" 
          style={{ 
            width: "auto", 
            height: isMobile ? "90%" : "auto", 
            maxWidth: isMobile ? "200px" : "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center" 
          }}
        >
          <CoverCanvas 
            coverData={coverData} 
            width={isMobile ? 200 : 240}
            height={isMobile ? 320 : 384}
            scale={2} // Add scale factor for higher resolution
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default CoverPreview;
