
import CoverCanvas from "../CoverCanvas";
import { CoverData } from "../CoverTypes";

interface CoverPreviewProps {
  coverData: CoverData;
}

const CoverPreview = ({ coverData }: CoverPreviewProps) => {
  return (
    <div className="w-2/3 bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full h-full flex items-center justify-center">
        <CoverCanvas coverData={coverData} />
      </div>
    </div>
  );
};

export default CoverPreview;
