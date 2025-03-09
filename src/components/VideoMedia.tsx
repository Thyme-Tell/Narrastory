
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VideoMediaProps {
  media: {
    id: string;
    file_path: string;
    content_type: string;
    caption: string | null;
  };
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
  onVideoClick?: (url: string) => void;
}

// The default thumbnail images if we can't generate a real one
const DEFAULT_THUMBNAILS = [
  "photo-1518770660439-4636190af475", // circuit board
  "photo-1488590528505-98d2b5aba04b", // laptop
  "photo-1461749280684-dccba630e2f6", // programming
  "photo-1486312338219-ce68d2c6f44d", // macbook
];

// Map to store generated thumbnails
const thumbnailCache = new Map<string, string>();

const VideoMedia = ({ media, onCaptionUpdate, onDelete, onVideoClick }: VideoMediaProps) => {
  const { toast } = useToast();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

  const videoOptions = {
    controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    settings: ['quality', 'speed'],
    quality: {
      default: 720,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    }
  };

  // Generate thumbnail from the actual video
  useEffect(() => {
    if (thumbnailCache.has(media.id)) {
      setThumbnailUrl(thumbnailCache.get(media.id)!);
      return;
    }

    // Create a video element to extract the thumbnail
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = "anonymous";
    videoElement.src = data.publicUrl;
    
    // Try to get the poster when metadata is loaded
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.currentTime = 1; // Skip to 1 second to avoid black frames
    });

    // When seek completes, capture the frame
    videoElement.addEventListener('seeked', () => {
      try {
        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw the video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // Get the data URL from the canvas
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
          thumbnailCache.set(media.id, thumbnailDataUrl);
          setThumbnailUrl(thumbnailDataUrl);
          
          console.log("Generated video thumbnail for:", media.id);
        }
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        setThumbnailUrl(getFallbackThumbnail(media.id));
      }
      
      // Clean up
      videoElement.remove();
    });

    // Handle errors
    videoElement.addEventListener('error', () => {
      console.error("Error loading video for thumbnail:", videoElement.error);
      setThumbnailUrl(getFallbackThumbnail(media.id));
      videoElement.remove();
    });

    // Load the video but don't play it
    videoElement.load();
  }, [data.publicUrl, media.id]);

  const handleDelete = async () => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("story-media")
        .remove([media.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("story_media")
        .delete()
        .eq("id", media.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media deleted successfully",
      });

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

  // Generate a fallback thumbnail if needed
  const getFallbackThumbnail = (mediaId: string) => {
    const index = mediaId.charCodeAt(0) % DEFAULT_THUMBNAILS.length;
    return `https://images.unsplash.com/${DEFAULT_THUMBNAILS[index]}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div 
          className="max-h-[550px] rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onVideoClick?.(data.publicUrl)}
        >
          <Plyr
            source={{
              type: "video",
              sources: [
                {
                  src: data.publicUrl,
                  type: media.content_type,
                },
              ],
            }}
            options={videoOptions}
          />
        </div>
        <div className="absolute top-2 right-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this media.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <MediaCaption
        mediaId={media.id}
        caption={media.caption}
        onUpdate={onCaptionUpdate}
      />
    </div>
  );
};

// Export the thumbnail generator for use in other components
export const getVideoThumbnail = (mediaId: string): string => {
  if (thumbnailCache.has(mediaId)) {
    return thumbnailCache.get(mediaId)!;
  }
  
  // Return fallback thumbnail if not in cache
  const index = mediaId.charCodeAt(0) % DEFAULT_THUMBNAILS.length;
  return `https://images.unsplash.com/${DEFAULT_THUMBNAILS[index]}`;
};

export default VideoMedia;
