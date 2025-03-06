
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
