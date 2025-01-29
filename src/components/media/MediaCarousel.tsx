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

interface MediaCarouselProps {
  mediaItems: StoryMediaItem[];
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const MediaCarousel = ({ mediaItems, onCaptionUpdate, onDelete }: MediaCarouselProps) => {
  if (!mediaItems.length) return null;

  // Placeholder functions for required ImageMedia props
  const handleImageClick = (url: string) => {
    console.log("Image clicked:", url);
  };

  const handleStartCrop = (url: string, mediaId: string) => {
    console.log("Start crop:", url, mediaId);
  };

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
      </div>
      <Carousel className="w-[65%] mx-auto">
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
    </div>
  );
};

export default MediaCarousel;