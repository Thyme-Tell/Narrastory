import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryBookModalProps {
  onSuccess: () => void;
  children: React.ReactNode;
}

export function CreateStoryBookModal({ onSuccess, children }: CreateStoryBookModalProps) {
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
      // Reset form
      setTitle("");
      setDescription("");
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
        {children}
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
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Storybook"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}