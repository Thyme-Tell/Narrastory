import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Book } from "lucide-react";

const StorybooksList = () => {
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      // Fetch storybooks where user is owner or collaborator
      const { data: ownedStorybooks, error: ownedError } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          profile_id,
          profiles (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("Error fetching owned storybooks:", ownedError);
        return [];
      }

      const { data: collaborativeStorybooks, error: collabError } = await supabase
        .from("storybook_collaborators")
        .select(`
          storybook:storybooks (
            id,
            title,
            description,
            created_at,
            profile_id,
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (collabError) {
        console.error("Error fetching collaborative storybooks:", collabError);
        return ownedStorybooks || [];
      }

      // Combine and deduplicate storybooks
      const allStorybooks = [
        ...(ownedStorybooks || []),
        ...(collaborativeStorybooks?.map(item => item.storybook) || [])
      ];

      // Remove duplicates based on storybook ID
      return Array.from(
        new Map(allStorybooks.map(book => [book.id, book])).values()
      );
    },
  });

  if (isLoading) {
    return <div>Loading storybooks...</div>;
  }

  return (
    <div className="space-y-4">
      {storybooks?.map((storybook) => (
        <div
          key={storybook.id}
          className="p-4 border rounded-lg bg-white/80 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{storybook.title}</h3>
              {storybook.description && (
                <p className="text-muted-foreground mt-1">{storybook.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Created by {storybook.profiles.first_name} {storybook.profiles.last_name}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/storybooks/${storybook.id}`}>
                <Book className="mr-2 h-4 w-4" />
                View Storybook
              </Link>
            </Button>
          </div>
        </div>
      ))}
      
      {(!storybooks || storybooks.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No storybooks found.</p>
        </div>
      )}
    </div>
  );
};

export default StorybooksList;