import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Storybooks = () => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading } = useQuery({
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
            <h1 className="text-2xl font-semibold">Storybooks</h1>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Storybook
            </Button>
          </div>
          
          {storybooks?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No storybooks yet. Create your first one!
            </p>
          ) : (
            <div className="grid gap-4">
              {storybooks?.map((storybook) => (
                <div
                  key={storybook.id}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storybooks;