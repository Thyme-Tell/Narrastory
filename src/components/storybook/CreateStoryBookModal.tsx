import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryBookModalProps {
  onSuccess: () => void;
}

export function CreateStoryBookModal({ onSuccess }: CreateStoryBookModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: storybook, error } = await supabase
        .from("storybooks")
        .insert({ title, description })
        .select()
        .single();

      if (error) throw error;

      if (storybook) {
        // Create owner membership
        const { error: memberError } = await supabase
          .from("storybook_members")
          .insert({
            storybook_id: storybook.id,
            profile_id: (await supabase.auth.getUser()).data.user?.id,
            role: "owner",
            added_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (memberError) throw memberError;
      }

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Storybook
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Storybook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Storybook"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}