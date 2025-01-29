import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StoryBookSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: storybook, isLoading } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("storybooks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Storybook deleted successfully",
      });
      navigate("/storybooks");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete storybook",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!storybook) {
    return <div className="container mx-auto p-6">Storybook not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Storybook Settings</h1>
      
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          <div className="border border-red-200 rounded p-4">
            <p className="text-sm text-gray-600 mb-4">
              Once you delete a storybook, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Storybook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}