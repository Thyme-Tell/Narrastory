
import CoverCanvas from "../cover/CoverCanvas";
import { CoverData } from "../cover/CoverTypes";

interface BookCoverPreviewProps {
  coverData: CoverData;
  isLoading: boolean;
}

const BookCoverPreview = ({ coverData, isLoading }: BookCoverPreviewProps) => {
  if (isLoading) {
    return (
      <div className="w-[300px]">
        <div className="w-full aspect-[5/8] bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-[300px]">
      <div className="book-preview-container rounded-lg shadow-lg overflow-hidden">
        <CoverCanvas 
          coverData={coverData} 
          width={300}
          height={480}
        />
      </div>
    </div>
  );
};

export default BookCoverPreview;
