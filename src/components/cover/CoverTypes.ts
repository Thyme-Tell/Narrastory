
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
  backgroundSettings?: {
    position: 'center' | 'fill' | 'fit' | 'stretch';
    scale: number;
    opacity: number;
    blur: number;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
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
  onRemoveImage: () => void;
  onUploadImage: (file: File) => Promise<void>;
  onBackgroundSettingsChange: (settings: Partial<CoverData['backgroundSettings']>) => void;
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
  authorText: "",  // This will be populated with the profile name
  titleColor: "#303441",
  authorColor: "#303441",
  titleSize: 21,
  authorSize: 14,
  layout: 'centered',
  backgroundSettings: {
    position: 'center',
    scale: 1,
    opacity: 1,
    blur: 0
  }
};
