import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { MoreVertical, Pencil, Trash2, BookPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

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

  // Fetch storybooks for the current user
  const { data: storybooks } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        console.log("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", session.session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching storybooks:", error);
        throw error;
      }
      return data || [];
    },
  });

  const handleAddToStorybook = async (storybookId: string) => {
    console.log("Adding story to storybook:", { storyId: story.id, storybookId });
    
    const { error } = await supabase
      .from("stories_storybooks")
      .insert([
        {
          story_id: story.id,
          storybook_id: storybookId,
        },
      ]);

    if (error) {
      console.error("Error adding story to storybook:", error);
      if (error.code === "23505") { // Unique violation
        toast({
          title: "Already Added",
          description: "This story is already in the selected storybook.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add story to storybook",
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "Success",
      description: "Story added to storybook",
    });
  };

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
    // First, get the story details
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

    // Insert into deleted_stories
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

    // Delete from stories
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <BookPlus className="h-4 w-4 mr-2" />
                    Add to Storybook
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {storybooks?.map((storybook) => (
                        <DropdownMenuItem
                          key={storybook.id}
                          onClick={() => handleAddToStorybook(storybook.id)}
                        >
                          {storybook.title}
                        </DropdownMenuItem>
                      ))}
                      {!storybooks?.length && (
                        <DropdownMenuItem disabled>
                          No storybooks available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
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
    </div>
  );
};

export default StoryCard;