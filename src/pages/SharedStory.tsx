import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StoryMedia from "@/components/StoryMedia";

const SharedStory = () => {
  const { token } = useParams();

  const { data: story, isLoading } = useQuery({
    queryKey: ["shared-story", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Story not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
          <p className="text-sm text-muted-foreground text-left">
            {new Date(story.created_at).toLocaleDateString()}
          </p>
          {story.title && (
            <h3 className="font-semibold text-lg text-left">{story.title}</h3>
          )}
          <p className="whitespace-pre-wrap text-atlantic text-left">{story.content}</p>
          <StoryMedia storyId={story.id} />
        </div>
      </div>
    </div>
  );
};

export default SharedStory;