
import { useIsMobile } from "@/hooks/use-mobile";
import CoverEditor from "../cover/CoverEditor";
import { CoverData } from "../cover/CoverTypes";

interface BookEditorModalsProps {
  profileId: string;
  isEditorOpen: boolean;
  isPreviewOpen: boolean; // Keeping for backwards compatibility
  coverData: CoverData;
  onCloseCoverEditor: () => void;
  onClosePreview: () => void; // Keeping for backwards compatibility
  onSaveCover: (coverData: CoverData) => Promise<void>;
}

const BookEditorModals = ({
  profileId,
  isEditorOpen,
  coverData,
  onCloseCoverEditor,
  onSaveCover
}: BookEditorModalsProps) => {
  return (
    <CoverEditor
      profileId={profileId}
      open={isEditorOpen}
      onClose={onCloseCoverEditor}
      onSave={onSaveCover}
      initialCoverData={coverData}
    />
  );
};

export default BookEditorModals;
