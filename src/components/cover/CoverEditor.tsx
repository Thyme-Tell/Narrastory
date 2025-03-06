
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CoverData, CoverEditorProps } from "./CoverTypes";
import EditorControlPanel from "./editor/EditorControlPanel";
import CoverPreview from "./editor/CoverPreview";
import ImageCropperDialog from "./editor/ImageCropperDialog";
import { useCoverEditorState } from "./hooks/useCoverEditorState";

const CoverEditor = ({ 
  profileId, 
  open, 
  onClose, 
  onSave,
  initialCoverData 
}: CoverEditorProps) => {
  const {
    coverData,
    isUploading,
    uploadedImageUrl,
    isCropperOpen,
    handleSave,
    handleBackgroundColorChange,
    handleTextColorChange,
    handleFileUpload,
    handleCropComplete,
    handleRemoveImage,
    handleCropCancel,
    handleTextChange,
    handleFontSizeChange,
    handleLayoutChange,
  } = useCoverEditorState({
    profileId,
    initialCoverData,
    onSave: (data: CoverData) => {
      onSave(data);
      onClose();
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Edit Book Cover</DialogTitle>
          <div className="flex h-[80vh]">
            <EditorControlPanel
              coverData={coverData}
              onSave={handleSave}
              onCancel={onClose}
              onBackgroundColorChange={handleBackgroundColorChange}
              onFileUpload={handleFileUpload}
              onRemoveImage={handleRemoveImage}
              isUploading={isUploading}
              onTextChange={handleTextChange}
              onTextColorChange={handleTextColorChange}
              onFontSizeChange={handleFontSizeChange}
              onLayoutChange={handleLayoutChange}
            />
            
            <CoverPreview coverData={coverData} />
          </div>
        </DialogContent>
      </Dialog>
      
      <ImageCropperDialog
        imageUrl={uploadedImageUrl}
        open={isCropperOpen}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </>
  );
};

export default CoverEditor;
