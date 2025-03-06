
import CoverCanvas from "../CoverCanvas";
import { CoverData } from "../CoverTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface CoverPreviewProps {
  coverData: CoverData;
  isLoading?: boolean;
}

const CoverPreview = ({ coverData, isLoading = false }: CoverPreviewProps) => {
  if (isLoading) {
    return (
      <div className="w-2/3 bg-gray-100 flex items-center justify-center p-6">
        <Skeleton className="w-full aspect-[5/8]" />
      </div>
    );
  }

  return (
    <div className="w-2/3 bg-gray-100 flex items-center justify-center p-6">
      <div className="book-preview-container w-full">
        <CoverCanvas 
          coverData={coverData} 
          width={400}
          height={640}
        />
      </div>
    </div>
  );
};

export default CoverPreview;
