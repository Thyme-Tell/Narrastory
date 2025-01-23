import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Storybook } from "@/types/storybook";
import { useToast } from "@/components/ui/use-toast";

export const useStorybooks = (profileId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Storybook[];
    },
  });

  const createStorybook = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const { data, error } = await supabase
        .from("storybooks")
        .insert([
          {
            profile_id: profileId,
            title,
            description,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storybooks", profileId] });
      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
    },
  });

  const addStoryToStorybook = useMutation({
    mutationFn: async ({ storyId, storybookId }: { storyId: string; storybookId: string }) => {
      const { error } = await supabase
        .from("stories_storybooks")
        .insert([
          {
            story_id: storyId,
            storybook_id: storybookId,
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Story added to storybook",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add story to storybook",
        variant: "destructive",
      });
    },
  });

  return {
    storybooks,
    isLoading,
    createStorybook,
    addStoryToStorybook,
  };
};