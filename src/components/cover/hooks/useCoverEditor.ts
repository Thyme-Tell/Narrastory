
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData } from "../CoverTypes";
import { useAuth } from "@/contexts/AuthContext";

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
      titleSize: 21,
      authorSize: 14,
      layout: 'centered',
    }
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG or WebP image",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB",
      });
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setUploadedImageUrl(fileUrl);
    setIsCropperOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      // Check authentication status first
      if (!isAuthenticated) {
        throw new Error("You must be logged in to upload images");
      }

      const fileExt = 'jpg';
      const fileName = `cover-${profileId}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading cropped image to storage bucket:', fileName);
      
      // Create a file path that includes the user ID to help with RLS
      const filePath = `${profileId}/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('book-covers')
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL');
      
      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      console.log('Got public URL:', data.publicUrl);
      
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
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message)
          : "There was an error uploading your image. Please try again.",
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
    toast({
      title: "Image removed",
      description: "Background image has been removed",
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
