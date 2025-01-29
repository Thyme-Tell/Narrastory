import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function StoryBooks() {
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          storybook_members!inner (
            role
          )
        `)
        .eq("storybook_members.profile_id", supabase.auth.getUser());

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Storybooks</h1>
        <Button asChild>
          <Link to="/storybooks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Storybook
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storybooks?.map((storybook) => (
          <Link
            key={storybook.id}
            to={`/storybooks/${storybook.id}`}
            className="block"
          >
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{storybook.title}</h2>
              {storybook.description && (
                <p className="text-gray-600 mb-4">{storybook.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Created {new Date(storybook.created_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}