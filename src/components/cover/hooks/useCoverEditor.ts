
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CoverData } from "../CoverTypes";
import { useBackgroundImageUpload } from "./useBackgroundImageUpload";
import { useCoverTextStyles } from "./useCoverTextStyles";
import { useCoverLayout } from "./useCoverLayout";

export function useCoverEditor(
  profileId: string, 
  initialCoverData: CoverData | undefined,
  onSave: (coverData: CoverData) => void,
  onClose: () => void
) {
  const [coverData, setCoverData] = useState<CoverData>(
    initialCoverData || {
      backgroundColor: "#CADCDA",
      titleText: "My Stories",
      authorText: "",
      titleColor: "#303441",
      authorColor: "#303441",
      titleSize:.21,
      authorSize: 14,
      layout: 'centered',
    }
  );
  const { toast } = useToast();

  // Import utilities
  const {
    isUploading,
    uploadedImageUrl,
    isCropperOpen,
    handleFileUpload,
    handleCropComplete,
    handleRemoveImage,
    handleCropCancel
  } = useBackgroundImageUpload(profileId, coverData, setCoverData);

  const {
    handleTextChange,
    handleTextColorChange,
    handleFontSizeChange
  } = useCoverTextStyles(coverData, setCoverData);

  const {
    handleBackgroundColorChange,
    handleLayoutChange
  } = useCoverLayout(coverData, setCoverData);

  const handleSave = () => {
    onSave(coverData);
    onClose();
    toast({
      title: "Cover saved",
      description: "Your book cover has been updated successfully",
    });
  };

  return {
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
  };
}
