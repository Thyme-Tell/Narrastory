
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import MediaCarousel from "./media/MediaCarousel";
import { StoryMediaItem } from "@/types/media";
import { generateQRCodeUrl, generateShortVideoUrl } from "@/utils/qrCodeUtils";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const { toast } = useToast();

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

  // Fetch profile name for generating short URLs
  const { data: profileInfo } = useQuery({
    queryKey: ["profile-info", storyId],
    queryFn: async () => {
      // First get the profile ID from the story
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("profile_id")
        .eq("id", storyId)
        .single();
      
      if (storyError) {
        console.error("Error fetching story:", storyError);
        return null;
      }
      
      // Then get the profile details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", storyData.profile_id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }
      
      return profileData;
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

  // Generate QR codes for videos if needed
  const mediaItemsWithQR = mediaItems.map(item => {
    if (item.content_type.startsWith('video/')) {
      const { data } = supabase.storage
        .from("story-media")
        .getPublicUrl(item.file_path);
      
      // Generate user-friendly name for shorter URL
      const userName = profileInfo ? 
        `${profileInfo.first_name}-${profileInfo.last_name}` : 
        `user-${item.id.substring(0, 6)}`;
      
      // Generate the short URL for the video
      const shortUrl = generateShortVideoUrl(
        profileInfo?.id || "", 
        userName, 
        item.id
      );
      
      // Generate QR code URL and log for debugging
      const qrCodeUrl = generateQRCodeUrl(shortUrl);
      console.log("Generated QR for video:", {
        videoUrl: data.publicUrl,
        shortUrl,
        qrCodeUrl
      });
      
      return {
        ...item,
        qrCodeUrl,
        shortUrl
      };
    }
    return item;
  });

  return (
    <MediaCarousel
      mediaItems={mediaItemsWithQR}
      onCaptionUpdate={handleCaptionUpdate}
      onDelete={refetch}
    />
  );
};

export default StoryMedia;
