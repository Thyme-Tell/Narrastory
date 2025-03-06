
import { useState, useEffect } from "react";
import { CoverData } from "../CoverTypes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UseCoverEditorStateParams {
  profileId: string;
  initialCoverData?: CoverData;
  onSave: (coverData: CoverData) => void;
}

export function useCoverEditorState({
  profileId,
  initialCoverData,
  onSave
}: UseCoverEditorStateParams) {
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

  // Update local state when props change
  useEffect(() => {
    if (initialCoverData) {
      setCoverData(initialCoverData);
    }
  }, [initialCoverData]);

  const handleSave = () => {
    onSave(coverData);
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
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to upload images",
        });
        setIsUploading(false);
        return;
      }

      const fileExt = 'jpg';
      const fileName = `book-cover-${profileId}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading to bucket: book-covers');
      console.log('File name:', fileName);
      
      const { data, error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Error details:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL');
      
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', urlData.publicUrl);
      
      setCoverData({
        ...coverData,
        backgroundImage: urlData.publicUrl,
      });

      toast({
        title: "Image uploaded",
        description: "Your background image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      let errorMessage = "There was an error uploading your image";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      if (error.statusCode) {
        errorMessage += ` (Status: ${error.statusCode})`;
      }
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
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
    handleLayoutChange,
  };
}
