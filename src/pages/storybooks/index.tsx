import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { StoryBookList } from "@/components/storybook/StoryBookList";
import { CreateStoryBookModal } from "@/components/storybook/CreateStoryBookModal";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";

interface StoryBook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const StoryBooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [storybooks, setStorybooks] = useState<StoryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Check if user has a profile (old authentication method)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone_number', Cookies.get('phone_number') || '')
          .maybeSingle();

        if (error || !profile) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view storybooks",
          });
          navigate("/sign-in");
          return;
        }
      }
    };

    checkAuth();
    fetchStorybooks();
  }, [navigate, toast]);

  const fetchStorybooks = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', Cookies.get('phone_number') || '')
        .maybeSingle();

      if (profile) {
        const { data, error } = await supabase
          .from('storybooks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStorybooks(data || []);
      }
    } catch (error) {
      console.error('Error fetching storybooks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load storybooks",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStoryBook = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, check for profile
      if (!session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone_number', Cookies.get('phone_number') || '')
          .maybeSingle();
          
        if (error || !profile) {
          throw new Error("No authentication");
        }
      }

      setShowCreateModal(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
      });
      navigate("/sign-in");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Storybooks</h1>
        <button
          onClick={handleCreateStoryBook}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Create New Storybook
        </button>
      </div>

      <StoryBookList storybooks={storybooks} isLoading={isLoading} />

      {showCreateModal && (
        <CreateStoryBookModal
          onSuccess={fetchStorybooks}
          onOpenChange={setShowCreateModal}
        >
          <div />
        </CreateStoryBookModal>
      )}
    </div>
  );
};

export default StoryBooks;