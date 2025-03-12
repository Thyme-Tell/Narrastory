
import { useState } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

const VideoMedia = ({ media, onCaptionUpdate, onDelete, onVideoClick }: VideoMediaProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

  const videoOptions = {
    controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    settings: ['quality', 'speed'],
    quality: {
      default: 720,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    },
    preload: 'metadata'
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

  const handlePlayerReady = () => {
    console.log("Plyr is ready");
    setIsLoading(false);
  };

  const handleVideoLoadError = () => {
    console.error("Video failed to load");
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div 
          className="max-h-[550px] rounded-lg overflow-hidden cursor-pointer relative"
          onClick={() => onVideoClick?.(data.publicUrl)}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-60 z-10">
              <LoadingSpinner className="h-8 w-8 text-green-800" />
            </div>
          )}
          <Plyr
            source={{
              type: "video",
              sources: [
                {
                  src: data.publicUrl,
                  type: media.content_type,
                  size: 720,
                },
              ],
            }}
            options={videoOptions}
            onReady={handlePlayerReady}
            onError={handleVideoLoadError}
          />
        </div>
        <div className="absolute top-2 right-2 z-20">
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

export default VideoMedia;
