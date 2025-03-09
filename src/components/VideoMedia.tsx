
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const VideoMedia = ({ media, onCaptionUpdate, onDelete, onVideoClick }: VideoMediaProps) => {
  const { toast } = useToast();
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

  // Generate a semi-random thumbnail for this video
  const getVideoThumbnail = () => {
    // Use a deterministic approach based on the video's ID to always get the same thumbnail for the same video
    const index = media.id.charCodeAt(0) % DEFAULT_THUMBNAILS.length;
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
export const getVideoThumbnail = (mediaId: string) => {
  const index = mediaId.charCodeAt(0) % DEFAULT_THUMBNAILS.length;
  return `https://images.unsplash.com/${DEFAULT_THUMBNAILS[index]}`;
};

export default VideoMedia;
