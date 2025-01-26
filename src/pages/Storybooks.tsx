import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import CreateStorybookDialog from "@/components/CreateStorybookDialog";

const Storybooks = () => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading, refetch } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          storybook_stories(
            story:stories(
              id,
              title,
              content
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch storybooks",
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading storybooks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Storybooks</h1>
            <CreateStorybookDialog onStorybookCreated={refetch} />
          </div>
          
          {storybooks?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No storybooks yet. Create your first one!
            </p>
          ) : (
            <div className="grid gap-4">
              {storybooks?.map((storybook) => (
                <Link
                  key={storybook.id}
                  to={`/storybooks/${storybook.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border bg-card text-card-foreground text-left hover:bg-accent transition-colors">
                    <h3 className="font-semibold text-lg">{storybook.title}</h3>
                    {storybook.description && (
                      <p className="text-muted-foreground mt-1">
                        {storybook.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {storybook.storybook_stories.length} stories
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storybooks;