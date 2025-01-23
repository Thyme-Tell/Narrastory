import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StorybooksListProps {
  profileId: string;
}

const StorybooksList = ({ profileId }: StorybooksListProps) => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          stories_storybooks (
            story:stories (
              id,
              title,
              content,
              created_at
            )
          )
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRemoveStory = async (storyId: string, storybookId: string) => {
    const { error } = await supabase
      .from("stories_storybooks")
      .delete()
      .match({
        story_id: storyId,
        storybook_id: storybookId,
      });

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
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storybooks...</p>;
  }

  if (!storybooks?.length) {
    return <p className="text-muted-foreground">No storybooks yet.</p>;
  }

  return (
    <div className="space-y-8">
      {storybooks.map((storybook) => (
        <div
          key={storybook.id}
          className="p-6 rounded-lg border bg-card text-card-foreground"
        >
          <Link 
            to={`/storybook/${storybook.id}`}
            className="hover:underline"
          >
            <h3 className="font-semibold text-lg">{storybook.title}</h3>
          </Link>
          {storybook.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {storybook.description}
            </p>
          )}
          
          <div className="mt-4 space-y-4">
            {storybook.stories_storybooks?.map(({ story }) => story && (
              <div key={story.id} className="p-4 rounded border bg-background">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {story.title && (
                      <h4 className="font-medium">{story.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {story.content.length > 150
                        ? `${story.content.slice(0, 150)}...`
                        : story.content}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStory(story.id, storybook.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {!storybook.stories_storybooks?.length && (
              <p className="text-sm text-muted-foreground">
                No stories in this storybook yet.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorybooksList;