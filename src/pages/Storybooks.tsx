import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Storybooks from "@/components/Storybooks";

const StorybooksPage = () => {
  const { id } = useParams();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  if (isLoadingProfile) {
    return <div className="p-4">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-4">Profile not found</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {profile && <Storybooks profileId={profile.id} />}
      </div>
    </div>
  );
};

export default StorybooksPage;