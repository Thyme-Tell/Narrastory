import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryBookList } from "@/components/storybook/StoryBookList";
import { CreateStoryBookModal } from "@/components/storybook/CreateStoryBookModal";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function StoryBooks() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your storybooks",
          variant: "destructive",
        });
        navigate("/signin");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const { data: storybooks, isLoading, error } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          storybook_members!inner (
            role,
            profile_id
          )
        `)
        .eq("storybook_members.profile_id", session.user.id);

      if (error) throw error;
      return data;
    },
    enabled: true, // The query will automatically wait for auth state
  });

  if (error) {
    toast({
      title: "Error loading storybooks",
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Storybooks</h1>
        <CreateStoryBookModal onSuccess={() => refetch()} />
      </div>

      <StoryBookList storybooks={storybooks || []} isLoading={isLoading} />
    </div>
  );
}