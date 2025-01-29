import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryBookList } from "@/components/storybook/StoryBookList";
import { CreateStoryBookModal } from "@/components/storybook/CreateStoryBookModal";

export default function StoryBooks() {
  const { data: storybooks, isLoading, refetch } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
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
        .eq("storybook_members.profile_id", user.user?.id);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Storybooks</h1>
        <CreateStoryBookModal onSuccess={refetch} />
      </div>

      <StoryBookList storybooks={storybooks || []} isLoading={isLoading} />
    </div>
  );
}