
import React from "react";
import { CoverData } from "../CoverTypes";
import CoverPreview from "./CoverPreview";
import EditorControlPanel from "./EditorControlPanel";

interface DesktopLayoutProps {
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
  onUploadImage: (file: File) => Promise<void>;
  onBackgroundSettingsChange: (settings: Partial<CoverData['backgroundSettings']>) => void;
}

const DesktopLayout = ({
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
  onUploadImage,
  onBackgroundSettingsChange,
}: DesktopLayoutProps) => {
  return (
    <div className="flex flex-row h-[90vh] bg-white">
      {/* Controls section - left 40% */}
      <div className="w-2/5 h-full border-r">
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
          onUploadImage={onUploadImage}
          onBackgroundSettingsChange={onBackgroundSettingsChange}
        />
      </div>
      
      {/* Preview section - right 60% */}
      <div className="w-3/5 h-full">
        <CoverPreview coverData={coverData} isLoading={isUploading} />
      </div>
    </div>
  );
};

export default DesktopLayout;
