
import React, { useEffect } from "react";
import { StoryMediaItem } from "@/types/media";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageMediaProps {
  mediaItems: (StoryMediaItem & { publicUrl?: string })[];
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
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      console.log(`PageMedia: Rendering ${mediaItems.length} media items`);
      mediaItems.forEach((media, index) => {
        console.log(`Media ${index + 1}:`, {
          id: media.id,
          contentType: media.content_type,
          hasPublicUrl: !!media.publicUrl
        });
      });
    } else if (!isMediaLoading) {
      console.log("PageMedia: No media items to display");
    }
  }, [mediaItems, isMediaLoading]);

  if (isMediaLoading) {
    return <Skeleton className={`w-full ${isMobile ? 'h-32' : 'h-40'} mt-4`} />;
  }

  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  return (
    <div className={`mt-${isMobile ? '4' : '6'} space-y-4`}>
      {mediaItems.slice(0, 1).map((media) => (
        <div key={media.id} className="border rounded-md p-2">
          {media.content_type?.startsWith("image/") ? (
            <div className="flex justify-center">
              <ImageMedia
                media={{
                  id: media.id,
                  file_path: media.file_path,
                  file_name: media.file_name || "image",
                  caption: media.caption,
                  // Pass the publicUrl if available
                  ...(media.publicUrl ? { publicUrl: media.publicUrl } : {})
                }}
                onImageClick={(url) => handleImageClick(url)}
                onStartCrop={(url) => handleStartCrop(url, media.id)}
                onCaptionUpdate={handleCaptionUpdate}
              />
            </div>
          ) : media.content_type?.startsWith("video/") ? (
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
              Unsupported media type: {media.content_type || 'unknown'}
            </div>
          )}
          {media.caption && (
            <p className={`text-${isMobile ? 'xs' : 'sm'} text-center italic mt-2`}>{media.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PageMedia;
