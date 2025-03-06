
import { useIsMobile } from "@/hooks/use-mobile";
import CoverEditor from "../cover/CoverEditor";
import BookPreview from "../book/BookPreview";
import { CoverData } from "../cover/CoverTypes";

interface BookEditorModalsProps {
  profileId: string;
  isEditorOpen: boolean;
  isPreviewOpen: boolean;
  coverData: CoverData;
  onCloseCoverEditor: () => void;
  onClosePreview: () => void;
  onSaveCover: (coverData: CoverData) => Promise<void>;
}

const BookEditorModals = ({
  profileId,
  isEditorOpen,
  isPreviewOpen,
  coverData,
  onCloseCoverEditor,
  onClosePreview,
  onSaveCover
}: BookEditorModalsProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <CoverEditor
        profileId={profileId}
        open={isEditorOpen}
        onClose={onCloseCoverEditor}
        onSave={onSaveCover}
        initialCoverData={coverData}
      />

      <BookPreview 
        profileId={profileId}
        open={isPreviewOpen}
        onClose={onClosePreview}
        isMobile={isMobile}
      />
    </>
  );
};

export default BookEditorModals;
