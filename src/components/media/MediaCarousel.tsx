
import React from "react";
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
import ImageCropper from "@/components/ImageCropper";
import EnlargedImageView from "./EnlargedImageView";
import { useMediaCarousel } from "./useMediaCarousel";

interface MediaCarouselProps {
  mediaItems: StoryMediaItem[];
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const MediaCarousel = React.forwardRef<HTMLDivElement, MediaCarouselProps>(
  ({ mediaItems, onCaptionUpdate, onDelete }, ref) => {
    const {
      selectedMedia,
      cropData,
      setCropData,
      handleImageClick,
      handleCloseEnlargedView,
      handleStartCrop,
      handleCropComplete,
      handleDelete,
    } = useMediaCarousel(mediaItems, onDelete);

    if (!mediaItems.length) return null;

    return (
      <div className="mb-8" ref={ref}>
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
                      onImageClick={(url) => handleImageClick(url, media.id)}
                      onStartCrop={(url) => handleImageClick(url, media.id)}
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
          {mediaItems.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>

        <EnlargedImageView
          selectedMedia={selectedMedia}
          onClose={handleCloseEnlargedView}
          onStartCrop={handleStartCrop}
          onDelete={handleDelete}
        />

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
  }
);

MediaCarousel.displayName = "MediaCarousel";

export default MediaCarousel;
