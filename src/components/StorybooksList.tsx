import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StorybooksListProps {
  profileId: string;
}

const StorybooksList = ({ profileId }: StorybooksListProps) => {
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storybooks...</p>;
  }

  if (!storybooks?.length) {
    return <p className="text-muted-foreground">No storybooks yet.</p>;
  }

  return (
    <div className="space-y-4">
      {storybooks.map((storybook) => (
        <div
          key={storybook.id}
          className="p-4 rounded-lg border bg-card text-card-foreground"
        >
          <h3 className="font-semibold">{storybook.title}</h3>
          {storybook.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {storybook.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StorybooksList;