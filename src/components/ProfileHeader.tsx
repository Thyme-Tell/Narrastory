
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
  ArrowDown, 
  ArrowUp,
  Phone, 
  Pencil 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

      // Try to directly save to Supabase first
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

      // Now also save to Synthflow
      const synthflowSuccess = await saveStoryToSynthflow(content);
      
      if (synthflowSuccess) {
        console.log("Story successfully saved to both Supabase and Synthflow");
      } else {
        console.warn("Story saved to Supabase but failed to save to Synthflow");
      }

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

  // Function to call the synthflow-story-save edge function
  const saveStoryToSynthflow = async (storyContent: string) => {
    try {
      // Format the story content for Synthflow
      const formattedContent = title ? `${title}\n${content}` : content;
      
      // Call the Synthflow story save edge function with proper request body
      const { data, error } = await supabase.functions.invoke('synthflow-story-save', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: profileId,
          story_content: formattedContent,
          metadata: {
            user_id: profileId,
            first_name: firstName,
            last_name: lastName
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error saving story to Synthflow:', error);
        return false;
      }

      console.log('Synthflow story save response:', data);
      return true;
    } catch (err) {
      console.error('Exception saving story to Synthflow:', err);
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold font-sans text-left">
          Your Stories
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            {sortOrder === 'newest' ? (
              <ArrowDown className="h-3.5 w-3.5 mr-1" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5 mr-1" />
            )}
            <span>{sortOrder === 'newest' ? 'Recent first' : 'Oldest first'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={() => onSortChange('newest')}
              className={`${sortOrder === 'newest' ? 'bg-accent' : ''}`}
            >
              <ArrowDown className="h-3.5 w-3.5 mr-2" />
              Recent first
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('oldest')}
              className={`${sortOrder === 'oldest' ? 'bg-accent' : ''}`}
            >
              <ArrowUp className="h-3.5 w-3.5 mr-2" />
              Oldest first
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
