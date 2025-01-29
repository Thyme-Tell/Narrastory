import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditStoryBookModal } from "@/components/storybook/EditStoryBookModal";

export default function StoryBook() {
  const { id } = useParams();

  const { data: storybook, isLoading, refetch } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          storybook_members!inner (
            profile_id,
            role,
            profiles!storybook_members_profile_id_fkey (
              first_name,
              last_name
            )
          ),
          storybook_stories (
            stories (
              id,
              title,
              content,
              created_at
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!storybook) {
    return <div className="container mx-auto p-6">Storybook not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{storybook.title}</h1>
          <EditStoryBookModal storybook={storybook} onSuccess={refetch} />
        </div>
        {storybook.description && (
          <p className="text-gray-600 mt-2">{storybook.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Stories</h2>
          <div className="space-y-4">
            {storybook.storybook_stories?.map((story) => (
              <div key={story.stories.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-medium mb-2">
                  {story.stories.title}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {story.stories.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Members</h2>
          <div className="space-y-2">
            {storybook.storybook_members?.map((member) => (
              <div
                key={member.profile_id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>
                  {member.profiles.first_name} {member.profiles.last_name}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}