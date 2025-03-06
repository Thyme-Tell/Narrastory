
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
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onFileUpload,
  onRemoveImage,
  onTextChange,
  onTextColorChange,
  onFontSizeChange,
  onLayoutChange,
}: MobileLayoutProps) => {
  return (
    <div className="flex flex-col h-[100vh] bg-white overflow-hidden">
      {/* Preview section - top 40% */}
      <div className="w-full" style={{ height: "40%" }}>
        <CoverPreview coverData={coverData} isLoading={isUploading} />
      </div>
      
      {/* Controls section - bottom 60% */}
      <div className="w-full" style={{ height: "60%" }}>
        <EditorControlPanel
          coverData={coverData}
          onSave={onSave}
          onCancel={onClose}
          onBackgroundColorChange={onBackgroundColorChange}
          onFileUpload={onFileUpload}
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
