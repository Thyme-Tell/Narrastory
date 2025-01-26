import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, PlusCircle, MinusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Story {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}

interface Storybook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  stories: Story[];
}

const Storybooks = () => {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const { toast } = useToast();

  const { data: storybooks, refetch: refetchStorybooks } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: storybooksData, error: storybooksError } = await supabase
        .from("storybooks")
        .select("*, storybook_stories(story_id, stories(*))");

      if (storybooksError) throw storybooksError;

      return storybooksData.map((storybook: any) => ({
        ...storybook,
        stories: storybook.storybook_stories.map((ss: any) => ss.stories),
      }));
    },
  });

  const { data: availableStories } = useQuery({
    queryKey: ["available-stories"],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;
      return storiesData;
    },
  });

  const handleCreateStorybook = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("storybooks").insert({
      title: newTitle,
      description: newDescription,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook created successfully",
    });
    setNewTitle("");
    setNewDescription("");
    refetchStorybooks();
  };

  const handleDeleteStorybook = async (id: string) => {
    const { error } = await supabase.from("storybooks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook deleted successfully",
    });
    refetchStorybooks();
  };

  const handleAddStory = async (storybookId: string, storyId: string) => {
    const { error } = await supabase.from("storybook_stories").insert({
      storybook_id: storybookId,
      story_id: storyId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add story to storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story added to storybook successfully",
    });
    refetchStorybooks();
  };

  const handleRemoveStory = async (storybookId: string, storyId: string) => {
    const { error } = await supabase
      .from("storybook_stories")
      .delete()
      .match({ storybook_id: storybookId, story_id: storyId });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove story from storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story removed from storybook successfully",
    });
    refetchStorybooks();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Storybooks</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Storybook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Storybook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <Button onClick={handleCreateStorybook}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storybooks?.map((storybook: Storybook) => (
          <div
            key={storybook.id}
            className="border rounded-lg p-6 space-y-4 bg-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{storybook.title}</h2>
                {storybook.description && (
                  <p className="text-muted-foreground mt-1">
                    {storybook.description}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Storybook</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this storybook? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteStorybook(storybook.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Stories</h3>
              {storybook.stories?.map((story: Story) => (
                <div
                  key={story.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <span>{story.title || "Untitled Story"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveStory(storybook.id, story.id)
                    }
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Story
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Story to Storybook</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {availableStories?.map((story: Story) => (
                      <div
                        key={story.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span>{story.title || "Untitled Story"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAddStory(storybook.id, story.id)
                          }
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storybooks;