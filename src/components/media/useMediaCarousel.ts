
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoryMediaItem } from "@/types/media";

export function useMediaCarousel(mediaItems: StoryMediaItem[], onDelete?: () => void) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [cropData, setCropData] = useState<{ url: string; mediaId: string } | null>(null);
  const { toast } = useToast();

  const handleImageClick = (url: string, mediaId: string) => {
    setSelectedMedia(url);
    setSelectedMediaId(mediaId);
  };

  const handleCloseEnlargedView = () => {
    setSelectedMedia(null);
  };

  const handleStartCrop = () => {
    if (selectedMedia && selectedMediaId) {
      setCropData({ url: selectedMedia, mediaId: selectedMediaId });
      setSelectedMedia(null);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropData) return;

    try {
      const fileExt = 'jpeg';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('story_media')
        .update({ file_path: filePath })
        .eq('id', cropData.mediaId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image cropped successfully",
      });

      setCropData(null);

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error updating cropped image:', error);
      toast({
        title: "Error",
        description: "Failed to update cropped image",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedMediaId) return;

    try {
      const mediaToDelete = mediaItems.find(m => m.id === selectedMediaId);
      if (!mediaToDelete) return;

      const { error: storageError } = await supabase.storage
        .from("story-media")
        .remove([mediaToDelete.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("story_media")
        .delete()
        .eq("id", selectedMediaId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media deleted successfully",
      });

      setSelectedMedia(null);

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  return {
    selectedMedia,
    selectedMediaId,
    cropData,
    setCropData,
    handleImageClick,
    handleCloseEnlargedView,
    handleStartCrop,
    handleCropComplete,
    handleDelete,
  };
}
