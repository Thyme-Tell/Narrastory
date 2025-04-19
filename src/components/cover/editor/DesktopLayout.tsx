import React from "react";
import { CoverData, BackgroundType, DropzoneProps } from "../CoverTypes";
import CoverPreview from "./CoverPreview";
import EditorControlPanel from "./EditorControlPanel";

interface DesktopLayoutProps {
  coverData: CoverData;
  isUploading: boolean;
  onSave: () => void;
  onClose: () => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  onRemoveImage: () => void;
  onUploadImage: (imageUrl: string) => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
  dropzoneProps: DropzoneProps;
}

const DesktopLayout = ({
  coverData,
  isUploading,
  onSave,
  onClose,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onRemoveImage,
  onUploadImage,
  onTextChange,
  onTextColorChange,
  onFontSizeChange,
  onLayoutChange,
  dropzoneProps,
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
          onBackgroundTypeChange={onBackgroundTypeChange}
          onRemoveImage={onRemoveImage}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
          onTextChange={onTextChange}
          onTextColorChange={onTextColorChange}
          onFontSizeChange={onFontSizeChange}
          onLayoutChange={onLayoutChange}
          dropzoneProps={dropzoneProps}
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
