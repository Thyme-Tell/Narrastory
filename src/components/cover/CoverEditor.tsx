import { useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CoverEditorProps } from "./CoverTypes";
import MobileLayout from "./editor/MobileLayout";
import DesktopLayout from "./editor/DesktopLayout";
import { useCoverEditor } from "./hooks/useCoverEditor";
import { useDropzone } from 'react-dropzone';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { optimizeImage } from '@/lib/cover-photo';

const CoverEditor = ({ 
  profileId, 
  open, 
  onClose, 
  onSave,
  initialCoverData 
}: CoverEditorProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { session } = useAuth();
  
  const {
    coverData,
    isUploading,
    handleSave,
    handleBackgroundColorChange,
    handleBackgroundTypeChange,
    handleTextColorChange,
    handleRemoveImage,
    handleTextChange,
    handleFontSizeChange,
    handleLayoutChange,
    handleUploadImage,
    setIsUploading,
  } = useCoverEditor(profileId, initialCoverData, onSave, onClose);

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Helper function to delete old image files
  const deleteOldImage = async (url: string | null) => {
    if (!url) return;
    
    try {
      const filename = getFilenameFromUrl(url);
      await supabase.storage
        .from('cover-photos')
        .remove([`high-res/${filename}`, `preview/${filename}`]);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Delete old image files if they exist
      if (coverData.backgroundPhotoUrl) {
        await deleteOldImage(coverData.backgroundPhotoUrl);
      }

      // Generate unique filenames
      const timestamp = Date.now();
      const filename = `${profileId}-${timestamp}`;

      // Upload high-res version
      const { data: highResData, error: highResError } = await supabase.storage
        .from('cover-photos')
        .upload(`high-res/${filename}`, file, {
          upsert: true,
          contentType: file.type
        });

      if (highResError) throw highResError;

      // Create and upload preview version
      const previewBlob = await optimizeImage(file);
      const { data: previewData, error: previewError } = await supabase.storage
        .from('cover-photos')
        .upload(`preview/${filename}`, previewBlob, {
          upsert: true,
          contentType: file.type
        });

      if (previewError) throw previewError;

      // Get URLs for both versions
      const { data: urls } = await supabase.storage
        .from('cover-photos')
        .createSignedUrls([`high-res/${filename}`, `preview/${filename}`], 3600);

      if (urls && urls.length === 2) {
        const [highResUrl, previewUrl] = urls.map(u => u.signedUrl);
        handleUploadImage(file);
        toast({
          title: "Image uploaded",
          description: "Your cover photo has been updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

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
            onBackgroundTypeChange={handleBackgroundTypeChange}
            onRemoveImage={handleRemoveImage}
            onUploadImage={handleUploadImage}
            onTextChange={handleTextChange}
            onTextColorChange={handleTextColorChange}
            onFontSizeChange={handleFontSizeChange}
            onLayoutChange={handleLayoutChange}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
        ) : (
          <DesktopLayout
            coverData={coverData}
            isUploading={isUploading}
            onSave={handleSave}
            onClose={onClose}
            onBackgroundColorChange={handleBackgroundColorChange}
            onBackgroundTypeChange={handleBackgroundTypeChange}
            onRemoveImage={handleRemoveImage}
            onUploadImage={handleUploadImage}
            onTextChange={handleTextChange}
            onTextColorChange={handleTextColorChange}
            onFontSizeChange={handleFontSizeChange}
            onLayoutChange={handleLayoutChange}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoverEditor;
