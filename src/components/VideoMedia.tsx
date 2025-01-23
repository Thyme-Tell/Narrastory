import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoMediaProps {
  media: {
    id: string;
    file_path: string;
    content_type: string;
    caption: string | null;
  };
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const VideoMedia = ({ media, onCaptionUpdate, onDelete }: VideoMediaProps) => {
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
      // First delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("story-media")
        .remove([media.file_path]);

      if (storageError) throw storageError;

      // Then delete the database record
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

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="aspect-square rounded-lg overflow-hidden">
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
          <Button
            size="icon"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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