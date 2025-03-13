
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CoverEditorProps } from "./CoverTypes";
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
    handleSave,
    handleBackgroundColorChange,
    handleTextColorChange,
    handleRemoveImage,
    handleTextChange,
    handleFontSizeChange,
    handleLayoutChange
  } = useCoverEditor(profileId, initialCoverData, onSave, onClose);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
        {isMobile ? (
          <MobileLayout
            coverData={coverData}
            isUploading={isUploading}
            onSave={handleSave}
            onClose={onClose}
            onBackgroundColorChange={handleBackgroundColorChange}
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
            onRemoveImage={handleRemoveImage}
            onTextChange={handleTextChange}
            onTextColorChange={handleTextColorChange}
            onFontSizeChange={handleFontSizeChange}
            onLayoutChange={handleLayoutChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoverEditor;
