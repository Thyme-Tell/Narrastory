
export interface CoverData {
  backgroundImage?: string;
  backgroundColor?: string;
  titleText?: string;
  authorText?: string;
  titleColor?: string;
  authorColor?: string;
  titleSize?: number;
  authorSize?: number;
  titlePosition?: { x: number; y: number };
  authorPosition?: { x: number; y: number };
  layout?: 'centered' | 'top' | 'bottom';
}

export interface CoverEditorProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
  onSave: (coverData: CoverData) => void;
  initialCoverData?: CoverData;
}

export interface BackgroundTabProps {
  coverData: CoverData;
  onBackgroundColorChange: (color: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isUploading: boolean;
}

export interface TextTabProps {
  coverData: CoverData;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
}

export interface LayoutTabProps {
  coverData: CoverData;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
}

export const DEFAULT_COVER_DATA: CoverData = {
  backgroundColor: "#CADCDA",
  titleText: "My Stories",
  authorText: "",
  titleColor: "#303441",
  authorColor: "#303441",
  titleSize: 21, // Updated to be in the middle of the new range (18-24)
  authorSize: 14, // Updated to be in the middle of the new range (12-16)
  layout: 'centered',
};
