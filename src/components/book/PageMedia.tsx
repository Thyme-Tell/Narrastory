
import React from "react";
import { StoryMediaItem } from "@/types/media";
import { Skeleton } from "@/components/ui/skeleton";

interface PageMediaProps {
  mediaItems: StoryMediaItem[];
  isMediaLoading: boolean;
  handleImageClick: (url: string) => void;
  handleCaptionUpdate: (mediaId: string, caption: string) => void;
  handleStartCrop: (url: string, mediaId: string) => void;
}

const PageMedia = ({
  mediaItems,
  isMediaLoading,
  handleImageClick,
  handleCaptionUpdate,
  handleStartCrop,
}: PageMediaProps) => {
  if (isMediaLoading) {
    return <Skeleton className="w-full h-40 mt-6" />;
  }

  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  // Only show the first image in book preview to avoid excessive page consumption
  const firstImage = mediaItems.find(media => media.content_type && media.content_type.startsWith("image/"));
  
  if (!firstImage) {
    return null;
  }

  // Check if the image URL is valid
  const imageUrl = firstImage.file_path;
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    console.error("Invalid image URL:", imageUrl);
    return null;
  }

  return (
    <div className="mt-8 mb-4 flex justify-center">
      <div className="max-w-[90%] border rounded-md p-2">
        <img 
          src={imageUrl} 
          alt={firstImage.file_name || "Story image"} 
          className="max-h-[300px] w-auto object-contain mx-auto"
          onClick={() => handleImageClick(imageUrl)}
          onError={(e) => {
            console.error("Image failed to load:", imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
        {firstImage.caption && (
          <p className="text-sm text-center italic mt-2">{firstImage.caption}</p>
        )}
      </div>
    </div>
  );
};

export default PageMedia;
