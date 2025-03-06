
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CoverEditorProps } from "./CoverTypes";
import ImageCropperDialog from "./editor/ImageCropperDialog";
import MobileLayout from "./editor/MobileLayout";
import DesktopLayout from "./editor/DesktopLayout";
import { useCoverEditor } from "./hooks/useCoverEditor";

const CoverEditor = ({ 
  profileId, 
  open, 
  onClose, 
  onSave,
  initialCoverData 
}: CoverEditorProps) => {
  const isMobile = useIsMobile();
  
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
    handleLayoutChange
  } = useCoverEditor(profileId, initialCoverData, onSave, onClose);
  
  useEffect(() => {
    if (initialCoverData) {
      // This is handled in the hook now, but left for future potential needs
    }
  }, [initialCoverData]);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
          {isMobile ? (
            <MobileLayout
              coverData={coverData}
              isUploading={isUploading}
              onSave={handleSave}
              onClose={onClose}
              onBackgroundColorChange={handleBackgroundColorChange}
              onFileUpload={handleFileUpload}
              onRemoveImage={handleRemoveImage}
              onTextChange={handleTextChange}
              onTextColorChange={handleTextColorChange}
              onFontSizeChange={handleFontSizeChange}
              onLayoutChange={handleLayoutChange}
            />
          ) : (
            <DesktopLayout
              coverData={coverData}
              isUploading={isUploading}
              onSave={handleSave}
              onClose={onClose}
              onBackgroundColorChange={handleBackgroundColorChange}
              onFileUpload={handleFileUpload}
              onRemoveImage={handleRemoveImage}
              onTextChange={handleTextChange}
              onTextColorChange={handleTextColorChange}
              onFontSizeChange={handleFontSizeChange}
              onLayoutChange={handleLayoutChange}
            />
          )}
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
