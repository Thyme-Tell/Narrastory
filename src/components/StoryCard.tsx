
import { useState } from "react";
import { useStoryOperations } from "./story/StoryOperations";
import StoryEditForm from "./StoryEditForm";
import StoryContent from "./StoryContent";
import StoryHeader from "./story/StoryHeader";
import ShareDialog from "./story/ShareDialog";
import { formatDistanceToNow } from "date-fns";
import { Book } from "lucide-react";

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
  
  const { handleSave, handleDelete, handleShare } = useStoryOperations({
    storyId: story.id,
    onUpdate,
  });

  // Calculate word count
  const wordCount = story.content.trim().split(/\s+/).length;
  
  // Format the created_at date
  const formattedDate = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });

  const onSave = async (title: string, content: string, date: Date) => {
    const success = await handleSave(title, content, date);
    if (success) {
      setIsEditing(false);
    }
  };

  const onShare = async () => {
    const useNativeShare = await handleShare(story);
    if (!useNativeShare) {
      setShowShareDialog(true);
    }
  };

  const shareUrl = story.share_token 
    ? `${window.location.origin}/stories/${story.share_token}`
    : null;

  return (
    <div className="p-4 pb-12 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <StoryEditForm
          initialTitle={story.title || ""}
          initialContent={story.content}
          initialDate={new Date(story.created_at)}
          onSave={onSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <StoryHeader
            date={story.created_at}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onShare={onShare}
          />
          
          {/* Story Metadata */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <div className="flex items-center">
              <Book className="h-3.5 w-3.5 mr-1" />
              <span>{wordCount} words</span>
            </div>
          </div>
          
          <StoryContent
            title={story.title}
            content={story.content}
            storyId={story.id}
            onUpdate={onUpdate}
          />
        </>
      )}

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default StoryCard;
