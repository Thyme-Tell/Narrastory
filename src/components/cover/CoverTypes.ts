export type BackgroundType = 'color' | 'image' | 'photo';

export interface CoverData {
  backgroundType: BackgroundType;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
  backgroundColor: string;
  textColor: string;
  titleText: string;
  authorText?: string;
  titleColor?: string;
  authorColor?: string;
  titleSize?: number;
  authorSize?: number;
  titlePosition?: { x: number; y: number };
  authorPosition?: { x: number; y: number };
  layout: 'centered' | 'top' | 'bottom' | 'left-aligned';
  backgroundPhotoUrl: string | null;
  previewPhotoUrl: string | null;
}

export interface CoverEditorProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
  onSave: (coverData: CoverData) => void;
  initialCoverData?: CoverData;
}

export interface DropzoneProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
}

export interface BackgroundTabProps {
  coverData: CoverData;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  onRemoveImage: () => void;
  onUploadImage: (imageUrl: string) => void;
  onImageOpacityChange: (opacity: number) => void;
  onTextColorChange: (color: string) => void;
}

export interface TextTabProps {
  coverData: CoverData;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
}

export interface LayoutTabProps {
  coverData: CoverData;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
}

export const DEFAULT_COVER_DATA: CoverData = {
  backgroundType: 'color',
  backgroundColor: "#CADCDA",
  backgroundImageOpacity: 1,
  titleText: "My Stories",
  authorText: "",  // This will be populated with the profile name
  titleColor: "#303441",
  authorColor: "#303441",
  titleSize: 21,
  authorSize: 14,
  layout: 'centered',
  backgroundPhotoUrl: null,
  previewPhotoUrl: null,
};
