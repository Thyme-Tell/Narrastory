
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData } from "../CoverTypes";

export function useCoverEditor(
  profileId: string, 
  initialCoverData: CoverData | undefined,
  onSave: (coverData: CoverData) => void,
  onClose: () => void
) {
  const [coverData, setCoverData] = useState<CoverData>(
    initialCoverData || {
      backgroundColor: "#f8f9fa",
      titleText: "My Stories",
      authorText: "",
      titleColor: "#333333",
      authorColor: "#666666",
      titleSize: 36,
      authorSize: 24,
      layout: 'centered',
    }
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(coverData);
    onClose();
    toast({
      title: "Cover saved",
      description: "Your book cover has been updated successfully",
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    setCoverData({
      ...coverData,
      backgroundColor: color,
    });
  };

  const handleTextColorChange = (color: string, type: 'title' | 'author') => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleColor: color,
      });
    } else {
      setCoverData({
        ...coverData,
        authorColor: color,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setUploadedImageUrl(fileUrl);
    setIsCropperOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      const fileExt = 'jpg';
      const fileName = `book-cover-${profileId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      setCoverData({
        ...coverData,
        backgroundImage: data.publicUrl,
      });

      toast({
        title: "Image uploaded",
        description: "Your background image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setCoverData({
      ...coverData,
      backgroundImage: undefined,
    });
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setUploadedImageUrl(null);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'title' | 'author'
  ) => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleText: e.target.value,
      });
    } else {
      setCoverData({
        ...coverData,
        authorText: e.target.value,
      });
    }
  };

  const handleFontSizeChange = (value: number[], type: 'title' | 'author') => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleSize: value[0],
      });
    } else {
      setCoverData({
        ...coverData,
        authorSize: value[0],
      });
    }
  };

  const handleLayoutChange = (layout: 'centered' | 'top' | 'bottom') => {
    setCoverData({
      ...coverData,
      layout,
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
