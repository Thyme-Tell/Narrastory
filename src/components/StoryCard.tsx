
import { useState } from "react";
import { useStoryOperations } from "./story/StoryOperations";
import StoryEditForm from "./StoryEditForm";
import StoryContent from "./StoryContent";
import StoryActions from "./story/StoryActions";
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

  const wordCount = story.content.trim().split(/\s+/).length;
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
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
          </div>
          
          {story.title && (
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
          )}
          
          {/* Date and word count right after title, before buttons */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
            <span>{formattedDate}</span>
            <span>•</span>
            <div className="flex items-center">
              <Book className="h-3.5 w-3.5 mr-1" />
              <span>{wordCount} words</span>
            </div>
          </div>
          
          <StoryActions
            onListen={() => {/* TODO: Implement listen functionality */}}
            onEdit={() => setIsEditing(true)}
            onShare={onShare}
            onDelete={handleDelete}
          />
          
          <StoryContent
            title={null} // Pass null to prevent duplicate title
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
        storyTitle={story.title}
      />
    </div>
  );
};

export default StoryCard;
