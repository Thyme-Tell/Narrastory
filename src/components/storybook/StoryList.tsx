import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AddStoryModal } from "./AddStoryModal";

interface StoryListProps {
  storyBookId: string;
}

export const StoryList = ({ storyBookId }: StoryListProps) => {
  const { toast } = useToast();

  const { data: stories, isLoading, refetch } = useQuery({
    queryKey: ["storybook-stories", storyBookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybook_stories")
        .select(`
          id,
          stories (
            id,
            title,
            content,
            created_at
          )
        `)
        .eq("storybook_id", storyBookId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRemoveStory = async (storyId: string) => {
    const { error } = await supabase
      .from("storybook_stories")
      .delete()
      .eq("storybook_id", storyBookId)
      .eq("story_id", storyId);

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
      description: "Story removed from storybook",
    });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Stories</h2>
        <AddStoryModal storyBookId={storyBookId} onSuccess={refetch} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading stories...</p>
      ) : stories?.length === 0 ? (
        <p className="text-muted-foreground">No stories in this storybook yet</p>
      ) : (
        <div className="space-y-4">
          {stories?.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {entry.stories.title || "Untitled Story"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStory(entry.stories.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entry.stories.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};