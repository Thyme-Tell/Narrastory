import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import StoriesList from "@/components/StoriesList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

const Storybook = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isAddingStory, setIsAddingStory] = useState(false);

  const { data: storybook, refetch: refetchStorybook } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          storybook_stories(
            story:stories(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: availableStories, refetch: refetchStories } = useQuery({
    queryKey: ["available-stories"],
    queryFn: async () => {
      const { data: existingStoryIds } = await supabase
        .from("storybook_stories")
        .select("story_id")
        .eq("storybook_id", id);

      const excludedIds = existingStoryIds?.map(item => item.story_id) || [];

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .not("id", "in", `(${excludedIds.join(",")})`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddStory = async (storyId: string) => {
    const { error } = await supabase
      .from("storybook_stories")
      .insert({
        storybook_id: id,
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
      description: "Story added to storybook",
    });

    setIsAddingStory(false);
    refetchStorybook();
    refetchStories();
  };

  if (!storybook) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
      </div>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">{storybook.title}</h1>
              {storybook.description && (
                <p className="text-muted-foreground mt-1">{storybook.description}</p>
              )}
            </div>
            <Dialog open={isAddingStory} onOpenChange={setIsAddingStory}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Story to Storybook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {availableStories?.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 rounded-lg border bg-card text-card-foreground text-left cursor-pointer hover:bg-accent"
                      onClick={() => handleAddStory(story.id)}
                    >
                      {story.title && <h3 className="font-semibold">{story.title}</h3>}
                      <p className="line-clamp-2">{story.content}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {(!availableStories || availableStories.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">
                      No stories available to add
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {storybook.storybook_stories?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No stories in this storybook yet. Add your first one!
            </p>
          ) : (
            <StoriesList
              stories={storybook.storybook_stories.map((item: any) => item.story)}
              isLoading={false}
              onUpdate={() => {
                refetchStorybook();
                refetchStories();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Storybook;