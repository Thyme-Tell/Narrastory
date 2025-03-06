
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
      <div className={`${isMobile ? "w-full flex-grow pb-28" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
        <Skeleton className="w-full h-full max-w-xs mx-auto aspect-[5/8]" />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "w-full flex-grow pb-28" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
      <div className="book-preview-container w-full h-full flex items-center justify-center">
        <div className="max-h-full" style={{ width: isMobile ? "90%" : "70%", maxWidth: "400px" }}>
          <CoverCanvas 
            coverData={coverData} 
            width={isMobile ? 280 : 400}
            height={isMobile ? 448 : 640}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverPreview;
