import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface StorybooksListProps {
  profileId: string;
}

const StorybooksList = ({ profileId }: StorybooksListProps) => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      // First, fetch storybooks owned by the user
      const { data: ownedStorybooks, error: ownedError } = await supabase
        .from("storybooks")
        .select(`
          *,
          stories_storybooks (
            story:stories (
              id
            )
          )
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("Error fetching owned storybooks:", ownedError);
        throw ownedError;
      }

      // Then, fetch storybooks where the user is a collaborator
      const { data: collaborativeStorybooks, error: collabError } = await supabase
        .from("storybook_collaborators")
        .select(`
          storybook:storybooks (
            id,
            title,
            description,
            created_at,
            stories_storybooks (
              story:stories (
                id
              )
            )
          )
        `)
        .eq("profile_id", profileId);

      if (collabError) {
        console.error("Error fetching collaborative storybooks:", collabError);
        throw collabError;
      }

      // Combine and deduplicate storybooks
      const collaborativeStorybooksData = collaborativeStorybooks
        .map(item => item.storybook)
        .filter(Boolean);

      const allStorybooks = [...(ownedStorybooks || []), ...(collaborativeStorybooksData || [])];
      
      // Remove duplicates based on storybook id
      const uniqueStorybooks = Array.from(
        new Map(allStorybooks.map(book => [book.id, book])).values()
      );

      console.log("Fetched storybooks:", uniqueStorybooks); // Debug log
      return uniqueStorybooks;
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storybooks...</p>;
  }

  if (!storybooks?.length) {
    return <p className="text-muted-foreground">No storybooks yet.</p>;
  }

  return (
    <div className="space-y-8">
      {storybooks.map((storybook) => (
        <Link 
          key={storybook.id}
          to={`/storybook/${storybook.id}`}
          className="block transition-all hover:scale-[1.02]"
        >
          <div className="p-6 rounded-lg border bg-card text-card-foreground hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">{storybook.title}</h3>
            {storybook.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {storybook.description}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground mt-4">
              {storybook.stories_storybooks?.length || 0} {storybook.stories_storybooks?.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default StorybooksList;