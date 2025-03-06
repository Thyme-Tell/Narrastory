
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
      <div className={`${isMobile ? "w-full flex-grow" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
        <Skeleton className="w-full aspect-[5/8] max-w-xs mx-auto" />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "w-full flex-grow" : "w-2/3"} bg-gray-100 flex items-center justify-center p-6`}>
      <div className={`book-preview-container ${isMobile ? "max-w-[240px]" : "w-full"} mx-auto`}>
        <CoverCanvas 
          coverData={coverData} 
          width={isMobile ? 240 : 400}
          height={isMobile ? 384 : 640}
        />
      </div>
    </div>
  );
};

export default CoverPreview;
