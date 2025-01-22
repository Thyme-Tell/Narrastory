import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { id } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-muted-foreground">
            {profile.email && `Email: ${profile.email}`}
          </p>
          <p className="text-muted-foreground">Phone: {profile.phone_number}</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Generated Stories</h2>
          <p className="text-muted-foreground">No stories generated yet.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;