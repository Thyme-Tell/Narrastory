import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import StoryEditForm from "./StoryEditForm";
import StoryActions from "./StoryActions";
import StoryContent from "./StoryContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoryCardProps {
  story: {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
    share_token: string | null;
  };
  onUpdate: () => void;
}

const StoryCard = ({ story, onUpdate }: StoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSave = async (title: string, content: string, date: Date) => {
    const { error } = await supabase
      .from("stories")
      .update({
        title,
        content,
        created_at: date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", story.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story updated successfully",
    });
    
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .select("*, profiles(id)")
      .eq("id", story.id)
      .single();

    if (storyError) {
      toast({
        title: "Error",
        description: "Failed to fetch story details",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("deleted_stories")
      .insert({
        original_id: story.id,
        profile_id: storyData.profile_id,
        content: storyData.content,
        title: storyData.title,
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
      .eq("id", story.id);

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
  };

  const handleShare = async () => {
    if (!story.share_token) {
      const { data, error } = await supabase
        .from("stories")
        .update({ share_token: crypto.randomUUID() })
        .eq("id", story.id)
        .select('share_token')
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate share link",
          variant: "destructive",
        });
        return;
      }
      
      onUpdate();
    }

    const shareUrl = `${window.location.origin}/stories/${story.share_token}`;

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: story.title || "My Story",
          text: "Check out my story on Narra",
          url: shareUrl,
        });
        toast({
          title: "Success",
          description: "Story shared successfully",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setShowShareDialog(true);
        }
      }
    } else {
      setShowShareDialog(true);
    }
  };

  const shareUrl = story.share_token 
    ? `${window.location.origin}/stories/${story.share_token}`
    : null;

  const copyShareLink = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
      
      // Reset the button text after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <StoryEditForm
          initialTitle={story.title || ""}
          initialContent={story.content}
          initialDate={new Date(story.created_at)}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground text-left">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
            <StoryActions
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          </div>
          <StoryContent
            title={story.title}
            content={story.content}
            storyId={story.id}
            onUpdate={onUpdate}
          />
        </>
      )}

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={shareUrl || ""}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyShareLink}>
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can view this story
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryCard;
