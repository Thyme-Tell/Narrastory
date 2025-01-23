import { Button } from "@/components/ui/button";
import { Crop, Trash2 } from "lucide-react";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageMediaProps {
  media: {
    id: string;
    file_path: string;
    file_name: string;
    caption: string | null;
  };
  onImageClick: (url: string) => void;
  onStartCrop: (url: string, mediaId: string) => void;
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const ImageMedia = ({ media, onImageClick, onStartCrop, onCaptionUpdate, onDelete }: ImageMediaProps) => {
  const { toast } = useToast();
  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

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
        <img
          src={data.publicUrl}
          alt={media.file_name}
          className="rounded-lg object-cover aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(data.publicUrl)}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onStartCrop(data.publicUrl, media.id)}
          >
            <Crop className="h-4 w-4" />
          </Button>
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

export default ImageMedia;