import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function StoryBookSettings() {
  const { id } = useParams();

  const { data: storybook, isLoading } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!storybook) {
    return <div>Storybook not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Storybook Settings</h1>
      
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">General Settings</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                defaultValue={storybook.title}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                defaultValue={storybook.description || ""}
              />
            </div>
            <Button>Save Changes</Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          <div className="border border-red-200 rounded p-4">
            <p className="text-sm text-gray-600 mb-4">
              Once you delete a storybook, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive">Delete Storybook</Button>
          </div>
        </div>
      </div>
    </div>
  );
}