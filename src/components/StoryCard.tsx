import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";

interface StoryCardProps {
  story: {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
  };
  onUpdate: () => void;
}

const StoryCard = ({ story, onUpdate }: StoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title || "");
  const [editContent, setEditContent] = useState(story.content);
  const { toast } = useToast();

  const handleSave = async () => {
    const { error } = await supabase
      .from("stories")
      .update({
        title: editTitle,
        content: editContent,
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

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Story title"
            className="w-full"
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[100px]"
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
          {story.title && (
            <h3 className="font-semibold text-lg">{story.title}</h3>
          )}
          <p className="whitespace-pre-wrap">{story.content}</p>
          <div className="mt-[30px] mb-[20px]">
            <StoryMediaUpload 
              storyId={story.id}
              onUploadComplete={onUpdate}
            />
          </div>
          <StoryMedia storyId={story.id} />
        </>
      )}
    </div>
  );
};

export default StoryCard;