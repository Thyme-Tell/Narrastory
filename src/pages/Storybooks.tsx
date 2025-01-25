import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Storybooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: ownedStorybooks, error: ownedError } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          profile_id,
          profiles:profiles(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("Error fetching owned storybooks:", ownedError);
        throw ownedError;
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
            profiles:profiles(first_name, last_name)
          )
        `)
        .order("created_at", { ascending: false });

      if (collabError) {
        console.error("Error fetching collaborative storybooks:", collabError);
        throw collabError;
      }

      // Combine and remove duplicates
      const allStorybooks = [
        ...(ownedStorybooks || []),
        ...(collaborativeStorybooks?.map(cb => cb.storybook) || [])
      ];

      // Remove duplicates based on storybook id
      return Array.from(new Map(allStorybooks.map(book => [book.id, book])).values());
    }
  });

  const handleCreateStorybook = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error("No active session found");
      }

      const { data: newStorybook, error } = await supabase
        .from("storybooks")
        .insert([
          {
            title: "New Storybook",
            description: "A collection of memories",
            profile_id: session.user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (newStorybook) {
        toast({
          title: "Success",
          description: "Storybook created successfully.",
        });
        navigate(`/storybook/${newStorybook.id}`);
      }
    } catch (error) {
      console.error("Error creating storybook:", error);
      toast({
        title: "Error",
        description: "Failed to create storybook. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Your Storybooks</h1>
        </div>
        <Button onClick={handleCreateStorybook}>
          <Plus className="h-4 w-4 mr-2" />
          Create Storybook
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading storybooks...</p>
      ) : storybooks?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven't created any storybooks yet.
          </p>
          <Button onClick={handleCreateStorybook}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Storybook
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {storybooks?.map((storybook) => (
            <div
              key={storybook.id}
              className="border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(`/storybook/${storybook.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{storybook.title}</h2>
              {storybook.description && (
                <p className="text-muted-foreground mb-4">{storybook.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Created by {storybook.profiles?.first_name} {storybook.profiles?.last_name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Storybooks;