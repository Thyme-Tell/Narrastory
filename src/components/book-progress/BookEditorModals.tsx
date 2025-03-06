
import { useState } from "react";
import CoverEditor from "../cover/CoverEditor";
import BookPreview from "../book/BookPreview";
import { CoverData } from "../cover/CoverTypes";
import { useToast } from "@/hooks/use-toast";

interface BookEditorModalsProps {
  profileId: string;
  isEditorOpen: boolean;
  isPreviewOpen: boolean;
  coverData: CoverData;
  onCloseCoverEditor: () => void;
  onClosePreview: () => void;
  onSaveCover: (coverData: CoverData) => Promise<boolean>;
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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCover = async (data: CoverData) => {
    setIsSaving(true);
    try {
      const success = await onSaveCover(data);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save cover data. Please try again."
        });
      }
    } catch (error) {
      console.error("Error in handleSaveCover:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save cover data. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <CoverEditor
        profileId={profileId}
        open={isEditorOpen}
        onClose={onCloseCoverEditor}
        onSave={handleSaveCover}
        initialCoverData={coverData}
      />

      <BookPreview 
        profileId={profileId}
        open={isPreviewOpen}
        onClose={onClosePreview}
      />
    </>
  );
};

export default BookEditorModals;
