import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

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
      const profileId = Cookies.get('profile_id');
      if (!profileId) {
        throw new Error("User not authenticated");
      }

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
            profile_id: profileId,
            role: "owner",
            added_by: profileId,
          });

        if (memberError) throw memberError;
      }

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      onSuccess();
    } catch (error) {
      console.error('Error creating storybook:', error);
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
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
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
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Storybook"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}