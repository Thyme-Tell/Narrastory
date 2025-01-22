import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaItems } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateCaption = useMutation({
    mutationFn: async ({ mediaId, caption }: { mediaId: string; caption: string }) => {
      const { error } = await supabase
        .from("story_media")
        .update({ caption })
        .eq("id", mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-media", storyId] });
      toast({
        title: "Success",
        description: "Caption updated successfully",
      });
      setEditingCaption(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update caption",
        variant: "destructive",
      });
    },
  });

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1); // Reset zoom when opening new image
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
    setZoomLevel(1); // Reset zoom when closing
  };

  const startEditingCaption = (mediaId: string, currentCaption: string | null) => {
    setEditingCaption(mediaId);
    setCaptionText(currentCaption || "");
  };

  const handleCaptionSubmit = (mediaId: string) => {
    updateCaption.mutate({ mediaId, caption: captionText });
  };

  if (!mediaItems?.length) return null;

  return (
    <>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-2 text-center">
          {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
        </div>
        <Carousel className="w-[55%] mx-auto">
          <CarouselContent>
            {mediaItems.map((media) => {
              const { data } = supabase.storage
                .from("story-media")
                .getPublicUrl(media.file_path);

              if (media.content_type.startsWith("image/")) {
                return (
                  <CarouselItem key={media.id} className="space-y-2">
                    <img
                      src={data.publicUrl}
                      alt={media.file_name}
                      className="rounded-lg object-cover aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(data.publicUrl)}
                    />
                    {editingCaption === media.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={captionText}
                          onChange={(e) => setCaptionText(e.target.value)}
                          placeholder="Add a caption..."
                          className="flex-1"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleCaptionSubmit(media.id)}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={() => setEditingCaption(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => startEditingCaption(media.id, media.caption)}
                      >
                        {media.caption || "Add a caption..."}
                      </div>
                    )}
                  </CarouselItem>
                );
              }

              // For video content
              if (media.content_type.startsWith("video/")) {
                return (
                  <CarouselItem key={media.id} className="space-y-2">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <video
                        src={data.publicUrl}
                        className="w-full h-full object-cover"
                        controls
                        poster={`${data.publicUrl}#t=0.1`}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {editingCaption === media.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={captionText}
                          onChange={(e) => setCaptionText(e.target.value)}
                          placeholder="Add a caption..."
                          className="flex-1"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleCaptionSubmit(media.id)}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={() => setEditingCaption(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => startEditingCaption(media.id, media.caption)}
                      >
                        {media.caption || "Add a caption..."}
                      </div>
                    )}
                  </CarouselItem>
                );
              }

              // For other media types, show a placeholder with filename
              return (
                <CarouselItem key={media.id}>
                  <div className="rounded-lg bg-muted p-4 flex items-center justify-center aspect-square">
                    <a
                      href={data.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-center break-words hover:underline"
                    >
                      {media.file_name}
                    </a>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-[90vw] w-fit h-[90vh] flex flex-col">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="h-full flex items-center justify-center">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Full screen view"
                  className="max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel})`,
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryMedia;