import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MediaCarousel, { MediaCarouselRef } from "./media/MediaCarousel";
import { StoryMediaItem } from "@/types/media";
import { useRef } from "react";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const { toast } = useToast();
  const carouselRef = useRef<MediaCarouselRef>(null);

  const { data: mediaItems = [], refetch } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        toast({
          title: "Error",
          description: "Failed to load media",
          variant: "destructive",
        });
        return [];
      }

      return data as StoryMediaItem[];
    },
  });

  const handleCaptionUpdate = async (mediaId: string, caption: string) => {
    const { error } = await supabase
      .from("story_media")
      .update({ caption })
      .eq("id", mediaId);

    if (error) {
      console.error("Error updating caption:", error);
      toast({
        title: "Error",
        description: "Failed to update caption",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Caption updated successfully",
    });
    refetch();
  };

  const handleRefetch = () => {
    refetch().then(() => {
      // After refetching, scroll to the last item
      if (carouselRef.current && mediaItems.length > 0) {
        carouselRef.current.scrollToIndex(mediaItems.length);
      }
    });
  };

  return (
    <MediaCarousel
      ref={carouselRef}
      mediaItems={mediaItems}
      onCaptionUpdate={handleCaptionUpdate}
      onDelete={handleRefetch}
    />
  );
};

export default StoryMedia;