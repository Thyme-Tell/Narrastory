
import { CoverData } from "@/components/cover/CoverTypes";
import CoverCanvas from "@/components/cover/CoverCanvas";
import { Skeleton } from "@/components/ui/skeleton";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
  compact?: boolean;
}

const BookCoverPreview = ({ coverData, isLoading, compact = false }: BookCoverPreviewProps) => {
  if (isLoading) {
    return <Skeleton className={`w-full ${compact ? 'h-16' : 'aspect-[5/8]'} mx-auto rounded-sm`} />;
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${compact ? 'p-0' : 'p-4'}`}>
      <div 
        className={`relative ${compact ? 'w-full h-full' : 'max-w-[240px] mx-auto'}`}
        style={{ 
          aspectRatio: !compact ? "5/8" : undefined,
          height: "auto"
        }}
      >
        <CoverCanvas 
          coverData={coverData} 
          width={compact ? 48 : 240}
          height={compact ? 64 : 384}
          scale={compact ? 1 : 2}
          className={`w-full h-full object-contain ${compact ? 'rounded-sm' : 'rounded-md shadow-md'}`}
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
