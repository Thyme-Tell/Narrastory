import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
import { StoryMediaItem } from "@/types/media";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ImageCropper from "@/components/ImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaCarouselProps {
  mediaItems: StoryMediaItem[];
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const MediaCarousel = ({ mediaItems, onCaptionUpdate, onDelete }: MediaCarouselProps) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [cropData, setCropData] = useState<{ url: string; mediaId: string } | null>(null);
  const { toast } = useToast();

  if (!mediaItems.length) return null;

  const handleImageClick = (url: string) => {
    setSelectedMedia(url);
  };

  const handleStartCrop = (url: string, mediaId: string) => {
    setCropData({ url, mediaId });
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropData) return;

    try {
      // Upload the cropped image
      const fileExt = 'jpeg';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update the media record with the new file path
      const { error: updateError } = await supabase
        .from('story_media')
        .update({ file_path: filePath })
        .eq('id', cropData.mediaId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image cropped successfully",
      });

      // Close the crop dialog
      setCropData(null);

      // Trigger a refresh if onDelete is provided (it's used as a refetch trigger)
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

  return (
    <div className="mb-8">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
      </div>
      <Carousel 
        className="w-[75%] mx-auto"
        opts={{
          align: "start",
          containScroll: false,
        }}
      >
        <CarouselContent className="-ml-2">
          {mediaItems.map((media) => {
            if (media.content_type.startsWith("image/")) {
              return (
                <CarouselItem key={media.id} className="pl-2 basis-[85%]">
                  <ImageMedia
                    media={media}
                    onCaptionUpdate={onCaptionUpdate}
                    onDelete={onDelete}
                    onImageClick={handleImageClick}
                    onStartCrop={handleStartCrop}
                  />
                </CarouselItem>
              );
            }
            if (media.content_type.startsWith("video/")) {
              return (
                <CarouselItem key={media.id} className="pl-2 basis-[85%]">
                  <VideoMedia
                    media={media}
                    onCaptionUpdate={onCaptionUpdate}
                    onDelete={onDelete}
                  />
                </CarouselItem>
              );
            }
            return null;
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          {selectedMedia && (
            <img
              src={selectedMedia}
              alt="Enlarged view"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {cropData && (
        <ImageCropper
          imageUrl={cropData.url}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropData(null)}
          open={!!cropData}
        />
      )}
    </div>
  );
};

export default MediaCarousel;