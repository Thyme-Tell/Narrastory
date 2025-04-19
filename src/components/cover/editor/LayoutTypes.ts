import { CoverData } from "../CoverTypes";
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

interface BaseLayoutProps {
  coverData: CoverData;
  isUploading: boolean;
  onSave: () => void;
  onClose: () => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: 'color' | 'image') => void;
  onRemoveImage: () => void;
  onUploadImage: (url: string) => void;
  onTextChange: (text: string) => void;
  onTextColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onLayoutChange: (layout: string) => void;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  isDragActive: boolean;
}

export type MobileLayoutProps = BaseLayoutProps;
export type DesktopLayoutProps = BaseLayoutProps; 