import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, Phone, Pencil } from "lucide-react";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  profileId: string;
}

const ProfileHeader = ({ firstName, lastName, profileId, onUpdate }: ProfileHeaderProps & { onUpdate: () => void }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreateStory = async () => {
    const { data, error } = await supabase
      .from("stories")
      .insert([
        {
          content: content,
          title: title,
          profile_id: profileId
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Could not create a new story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "New story created",
    });
    
    setIsDialogOpen(false);
    setTitle("");
    setContent("");
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold font-sans text-left">
          Your Stories
        </h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <ArrowDown className="h-3.5 w-3.5 mr-1" />
          <span>Recent first</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Button 
            className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
            onClick={() => window.location.href = "tel:+15072003303"}
          >
            <Phone className="mr-2 h-4 w-4" />
            Share Your Story by Phone
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a>
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="h-[40px]"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Write a Story
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Write a New Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your story"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Story</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                className="min-h-[200px]"
              />
            </div>
            <Button 
              className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
              onClick={handleCreateStory}
            >
              Save Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
