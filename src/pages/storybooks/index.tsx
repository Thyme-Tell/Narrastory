import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoryBookList } from "@/components/storybook/StoryBookList";
import { CreateStoryBookModal } from "@/components/storybook/CreateStoryBookModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StoryBooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Check if user has a profile (old authentication method)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .single();

        if (!profile) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view storybooks",
            variant: "destructive",
          });
          navigate("/sign-in");
        }
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const { data: storybooks, isLoading, error, refetch } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, check for profile
      if (!session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .single();
          
        if (!profile) {
          throw new Error("No authentication");
        }
      }

      const { data, error } = await supabase
        .from("storybooks")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  if (error) {
    toast({
      title: "Error loading storybooks",
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Storybooks</h1>
        <CreateStoryBookModal onSuccess={() => refetch()}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Storybook
          </Button>
        </CreateStoryBookModal>
      </div>
      <StoryBookList storybooks={storybooks || []} isLoading={isLoading} />
    </div>
  );
};

export default StoryBooks;