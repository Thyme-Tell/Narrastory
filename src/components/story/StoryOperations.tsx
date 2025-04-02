import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { encryptText, encryptStoryContent } from "@/utils/encryptionUtils";
import { notifyStoryCreated, notifyStoryShared } from "@/utils/slackNotification";

interface StoryOperations {
  storyId: string;
  onUpdate: () => void;
}

export const useStoryOperations = ({ storyId, onUpdate }: StoryOperations) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSave = async (title: string, content: string, date: Date) => {
    try {
      // Encrypt sensitive content before saving
      const encryptedTitle = await encryptText(title);
      const encryptedContent = await encryptStoryContent(content);
      
      const { error } = await supabase
        .from("stories")
        .update({
          title: encryptedTitle,
          content: encryptedContent,
          created_at: date.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", storyId);

      if (error) {
        console.error("Error updating story:", error);
        toast({
          title: "Error",
          description: "Failed to update story",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Story updated successfully",
      });
      
      onUpdate();
      return true;
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the story",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*, profiles(id, first_name, last_name)")
        .eq("id", storyId)
        .single();

      if (storyError) {
        toast({
          title: "Error",
          description: "Failed to fetch story details",
          variant: "destructive",
        });
        return;
      }

      // When archiving, we keep the original encrypted content
      const { error: insertError } = await supabase
        .from("deleted_stories")
        .insert({
          original_id: storyId,
          profile_id: storyData.profile_id,
          content: storyData.content, // Already encrypted in the database
          title: storyData.title, // Already encrypted in the database
          created_at: storyData.created_at,
          updated_at: storyData.updated_at,
        });

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to archive story",
          variant: "destructive",
        });
        return;
      }

      const { error: deleteError } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (deleteError) {
        toast({
          title: "Error",
          description: "Failed to delete story",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Story deleted successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the story",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (story: { share_token: string | null; title: string | null }) => {
    // Generate a share token if one doesn't exist
    if (!story.share_token) {
      try {
        const shareToken = crypto.randomUUID();
        const { data, error } = await supabase
          .from("stories")
          .update({ share_token: shareToken })
          .eq("id", storyId)
          .select('share_token, title, profile_id')
          .single();

        if (error) {
          toast({
            title: "Error",
            description: "Failed to generate share link",
            variant: "destructive",
          });
          return false;
        }
        
        // Get user info for the notification
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", data.profile_id)
          .single();
          
        if (profileData) {
          const authorName = `${profileData.first_name} ${profileData.last_name}`;
          // Send notification to Slack about story being shared
          notifyStoryShared(
            story.title || 'Untitled Story', 
            authorName,
            shareToken
          ).catch(err => console.error('Failed to send share notification:', err));
        }
        
        onUpdate();
      } catch (error) {
        console.error("Error in handleShare:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while generating a share link",
          variant: "destructive",
        });
        return false;
      }
    }

    // On mobile devices, we prefer to use the native share dialog
    // but we'll let the ShareDialog component handle this now
    return false;
  };

  return {
    handleSave,
    handleDelete,
    handleShare,
  };
};
