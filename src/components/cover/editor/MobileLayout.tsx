import React from "react";
import { CoverData, BackgroundType, DropzoneProps } from "../CoverTypes";
import CoverPreview from "./CoverPreview";
import EditorControlPanel from "./EditorControlPanel";
import { ChangeEvent } from 'react';

export interface MobileLayoutProps {
  coverData: CoverData;
  isUploading: boolean;
  onSave: () => void;
  onClose: () => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  onRemoveImage: () => void;
  onUploadImage: (url: string) => void;
  onTextChange: (e: ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
  dropzoneProps: DropzoneProps;
}

const MobileLayout = ({
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
  dropzoneProps
}: MobileLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="relative">
          <CoverPreview coverData={coverData} />
        </div>
        <div className="relative">
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
      </div>
    </div>
  );
};

export default MobileLayout;
