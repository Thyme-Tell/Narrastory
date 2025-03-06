
import React from "react";
import { StoryMediaItem } from "@/types/media";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
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

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      {mediaItems.slice(0, 1).map((media) => (
        <div key={media.id} className="border rounded-md p-2">
          {media.content_type.startsWith("image/") ? (
            <div className="flex justify-center">
              <ImageMedia
                media={{
                  id: media.id,
                  file_path: media.file_path,
                  file_name: media.file_name || "image",
                  caption: media.caption,
                }}
                onImageClick={handleImageClick}
                onStartCrop={handleStartCrop}
                onCaptionUpdate={handleCaptionUpdate}
              />
            </div>
          ) : media.content_type.startsWith("video/") ? (
            <VideoMedia
              media={{
                id: media.id,
                file_path: media.file_path,
                content_type: media.content_type,
                caption: media.caption,
              }}
              onCaptionUpdate={handleCaptionUpdate}
            />
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded">
              Unsupported media type: {media.content_type}
            </div>
          )}
          {media.caption && (
            <p className="text-sm text-center italic mt-2">{media.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PageMedia;
