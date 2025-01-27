import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName, onUpdate }: ProfileHeaderProps & { onUpdate: () => void }) => {
  const { toast } = useToast();

  const handleCreateStory = async () => {
    const { data, error } = await supabase
      .from("stories")
      .insert([
        {
          content: "",
          title: "",
          profile_id: firstName // This is safe because we're already on their profile page
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
    
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold font-sans text-left">
        {firstName} {lastName}'s Stories
      </h1>
      <Button 
        className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
        onClick={handleCreateStory}
      >
        Write a New Story
      </Button>
    </div>
  );
};

export default ProfileHeader;