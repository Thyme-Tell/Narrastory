
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
      <div className={`${isMobile ? "w-full" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
        <Skeleton className="w-full aspect-[5/8]" />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "w-full" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
      <div className={`book-preview-container ${isMobile ? "w-2/3" : "w-full"}`}>
        <CoverCanvas 
          coverData={coverData} 
          width={isMobile ? 300 : 400}
          height={isMobile ? 480 : 640}
        />
      </div>
    </div>
  );
};

export default CoverPreview;
