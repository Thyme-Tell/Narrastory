import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Storybook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const Storybooks = ({ profileId }: { profileId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const { data: storybooks, refetch } = useQuery({
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

  const handleCreateStorybook = async () => {
    try {
      const { error } = await supabase.from("storybooks").insert({
        profile_id: profileId,
        title,
        description: description || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });

      setIsOpen(false);
      setTitle("");
      setDescription("");
      refetch();
    } catch (error) {
      console.error("Error creating storybook:", error);
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Storybooks</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Storybook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Storybook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateStorybook} disabled={!title}>
                Create Storybook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storybooks?.map((storybook: Storybook) => (
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
            <p className="text-xs text-muted-foreground mt-2">
              Created {new Date(storybook.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storybooks;