import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CreateStorybookDialogProps {
  onStorybookCreated: () => void;
}

const CreateStorybookDialog = ({ onStorybookCreated }: CreateStorybookDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", "mia@narrastory.com")
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfileId(data.id);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileId) {
      toast({
        title: "Error",
        description: "Profile not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("storybooks")
      .insert([
        {
          title,
          description: description || null,
          profile_id: profileId,
        },
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook created successfully",
    });
    
    setOpen(false);
    setTitle("");
    setDescription("");
    onStorybookCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
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
            placeholder="Enter storybook title"
          />
          <FormField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter storybook description (optional)"
          />
          <Button type="submit" className="w-full">
            Create Storybook
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStorybookDialog;