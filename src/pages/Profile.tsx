import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Profile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-story', {
        body: {
          prompt: `Generate a creative story about ${profile?.first_name} ${profile?.last_name}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Story Generated!",
        description: "Your story has been created successfully.",
      });

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate story. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Stories</h2>
            <Button 
              onClick={generateStory} 
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate New Story"}
            </Button>
          </div>
          <p className="text-muted-foreground">No stories generated yet.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;