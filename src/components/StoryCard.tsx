import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { MoreVertical, Pencil, Trash2, BookPlus } from "lucide-react";
import { useStorybooks } from "@/hooks/useStorybooks";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isAddToStorybookOpen, setIsAddToStorybookOpen] = useState(false);
  const { toast } = useToast();

  const profileId = window.location.pathname.split('/')[2];
  const { storybooks } = useStorybooks(profileId);

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

  const handleAddToStorybook = async (storybookId: string) => {
    try {
      // First check if we have an authenticated session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }

      if (!session) {
        console.error('No active session');
        throw new Error('No active session');
      }

      console.log('Attempting to add story to storybook:', {
        storyId: story.id,
        storybookId,
        profileId,
        userId: session.user.id
      });

      // Verify storybook exists and user has access
      const { data: storybook, error: storybookError } = await supabase
        .from('storybooks')
        .select('profile_id, title')
        .eq('id', storybookId)
        .maybeSingle();

      console.log('Storybook query result:', { storybook, storybookError });

      if (storybookError) {
        console.error('Error fetching storybook:', storybookError);
        throw new Error('Failed to verify storybook access');
      }

      if (!storybook) {
        console.error('Storybook not found');
        throw new Error('Storybook not found');
      }

      // Check if story is already in the storybook
      const { data: existingEntry, error: checkError } = await supabase
        .from('stories_storybooks')
        .select('*')
        .eq('story_id', story.id)
        .eq('storybook_id', storybookId)
        .maybeSingle();

      console.log('Existing entry check:', { existingEntry, checkError });

      if (existingEntry) {
        throw new Error('Story is already in this storybook');
      }

      // Add story to storybook
      const { error: insertError } = await supabase
        .from('stories_storybooks')
        .insert([
          {
            story_id: story.id,
            storybook_id: storybookId,
          },
        ]);

      console.log('Insert result:', { insertError });

      if (insertError) {
        console.error('Error adding story to storybook:', insertError);
        throw insertError;
      }

      setIsAddToStorybookOpen(false);
      toast({
        title: "Success",
        description: `Story added to storybook "${storybook.title}"`,
      });
    } catch (error) {
      console.error('Error in handleAddToStorybook:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add story to storybook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 top-0 z-50 bg-background p-6 shadow-lg h-screen overflow-y-auto">
            <div className="space-y-4 max-w-2xl mx-auto">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Story title"
                className="w-full"
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[calc(100vh-200px)]"
              />
              <div className="flex space-x-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAddToStorybookOpen(true)}>
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add to Storybook
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will move this story to the archive. You can't undo this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {story.title && (
            <h3 className="font-semibold text-lg">{story.title}</h3>
          )}
          <p className="whitespace-pre-wrap text-atlantic">{story.content}</p>
          <div className="mt-[30px] mb-[20px]">
            <StoryMediaUpload storyId={story.id} onUploadComplete={onUpdate} />
          </div>
          <StoryMedia storyId={story.id} />
        </>
      )}

      <Dialog open={isAddToStorybookOpen} onOpenChange={setIsAddToStorybookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Storybook</DialogTitle>
            <DialogDescription>
              Choose a storybook to add this story to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {storybooks?.map((storybook) => (
              <Button
                key={storybook.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddToStorybook(storybook.id)}
              >
                {storybook.title}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryCard;