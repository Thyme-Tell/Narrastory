
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone,
  Pencil, 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  profileId: string;
  onUpdate: () => void;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (order: 'newest' | 'oldest') => void;
}

const ProfileHeader = ({ 
  firstName, 
  lastName, 
  profileId, 
  onUpdate, 
  sortOrder, 
  onSortChange 
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStory = async () => {
    try {
      setIsSubmitting(true);

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
        console.error("Supabase error:", error);
        return;
      }

      console.log("Story successfully saved to Supabase:", data);

      toast({
        title: "Success",
        description: "New story created",
      });
      
      setIsDialogOpen(false);
      setTitle("");
      setContent("");
      onUpdate();
    } catch (err) {
      console.error("Error creating story:", err);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold font-sans text-left">
          Your Stories
        </h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          {sortOrder === 'newest' ? 'Recent first' : 'Oldest first'}
        </Button>
      </div>
      
      <Card className="bg-white/90 border overflow-hidden">
        <div className="p-4 space-y-4">
          <Button 
            className="w-full h-12 bg-[#A33D29] hover:bg-[#A33D29]/90 text-white text-base"
            onClick={() => window.location.href = "tel:+15072003303"}
          >
            <Phone className="mr-2 h-5 w-5" />
            Share Your Story by Phone
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="w-full h-12 border-[#A33D29] text-[#A33D29] hover:bg-[#A33D29]/10"
          >
            <Pencil className="mr-2 h-5 w-5" />
            Write a Story
          </Button>
        </div>
      </Card>

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
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Story'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
