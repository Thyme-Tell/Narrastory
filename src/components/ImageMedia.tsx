
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
  const [isLoading, setIsLoading] = useState(true);
  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

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

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="max-h-[550px] overflow-hidden rounded-lg relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-60">
              <LoadingSpinner className="h-8 w-8 text-green-800" />
            </div>
          )}
          <img
            src={data.publicUrl}
            alt={media.file_name}
            className={`w-full h-full object-contain cursor-pointer hover:opacity-90 transition-all ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => onImageClick(data.publicUrl)}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
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

export default ImageMedia;
