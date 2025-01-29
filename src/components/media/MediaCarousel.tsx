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

interface MediaCarouselProps {
  mediaItems: StoryMediaItem[];
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const MediaCarousel = ({ mediaItems, onCaptionUpdate, onDelete }: MediaCarouselProps) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  if (!mediaItems.length) return null;

  const handleImageClick = (url: string) => {
    setSelectedMedia(url);
  };

  const handleStartCrop = (url: string, mediaId: string) => {
    console.log("Start crop:", url, mediaId);
  };

  return (
    <div className="mb-8">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
      </div>
      <Carousel className="w-[75%] mx-auto">
        <CarouselContent>
          {mediaItems.map((media) => {
            if (media.content_type.startsWith("image/")) {
              return (
                <CarouselItem key={media.id}>
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
                <CarouselItem key={media.id}>
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
    </div>
  );
};

export default MediaCarousel;