import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StoriesList from "@/components/StoriesList";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Storybook = () => {
  const { id } = useParams();

  const { data: storybook, isLoading: isLoadingStorybook } = useQuery({
    queryKey: ["storybook", id],
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
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const stories = storybook?.stories_storybooks?.map(({ story }) => story) || [];

  if (isLoadingStorybook) {
    return <p className="text-muted-foreground">Loading storybook...</p>;
  }

  if (!storybook) {
    return <p className="text-muted-foreground">Storybook not found.</p>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/profile/${storybook.profile_id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{storybook.title}</h1>
            {storybook.description && (
              <p className="text-muted-foreground mt-1">{storybook.description}</p>
            )}
          </div>
        </div>
        
        <StoriesList 
          stories={stories}
          isLoading={false}
          onUpdate={() => {}}
        />
      </div>
    </div>
  );
};

export default Storybook;