
import React from "react";
import { CoverData } from "../CoverTypes";
import CoverPreview from "./CoverPreview";
import EditorControlPanel from "./EditorControlPanel";

interface MobileLayoutProps {
  coverData: CoverData;
  isUploading: boolean;
  onSave: () => void;
  onClose: () => void;
  onBackgroundColorChange: (color: string) => void;
  onRemoveImage: () => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
}

const MobileLayout = ({
  coverData,
  isUploading,
  onSave,
  onClose,
  onBackgroundColorChange,
  onRemoveImage,
  onTextChange,
  onTextColorChange,
  onFontSizeChange,
  onLayoutChange,
}: MobileLayoutProps) => {
  return (
    <div className="flex flex-col h-[100vh] bg-white overflow-hidden">
      {/* Preview section - top 45% to ensure enough space for the full cover */}
      <div className="w-full flex items-center justify-center" style={{ height: "45%" }}>
        <CoverPreview coverData={coverData} isLoading={isUploading} />
      </div>
      
      {/* Controls section - bottom 55% */}
      <div className="w-full overflow-y-auto" style={{ height: "55%" }}>
        <EditorControlPanel
          coverData={coverData}
          onSave={onSave}
          onCancel={onClose}
          onBackgroundColorChange={onBackgroundColorChange}
          onRemoveImage={onRemoveImage}
          isUploading={isUploading}
          onTextChange={onTextChange}
          onTextColorChange={onTextColorChange}
          onFontSizeChange={onFontSizeChange}
          onLayoutChange={onLayoutChange}
        />
      </div>
    </div>
  );
};

export default MobileLayout;
