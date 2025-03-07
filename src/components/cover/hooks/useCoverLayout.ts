
import { CoverData } from "../CoverTypes";

export function useCoverLayout(
  coverData: CoverData,
  setCoverData: React.Dispatch<React.SetStateAction<CoverData>>
) {
  const handleBackgroundColorChange = (color: string) => {
    setCoverData({
      ...coverData,
      backgroundColor: color,
    });
  };

  const handleLayoutChange = (layout: 'centered' | 'top' | 'bottom') => {
    setCoverData({
      ...coverData,
      layout,
    });
  };

  return {
    handleBackgroundColorChange,
    handleLayoutChange
  };
}
