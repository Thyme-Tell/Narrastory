import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { id } = useParams();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone_number, created_at")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: stories, isLoading: isLoadingStories } = useQuery({
    queryKey: ["stories", profile?.phone_number],
    queryFn: async () => {
      if (!profile?.phone_number) return [];
      
      const { data, error } = await supabase
        .from("stories")
        .select(`
          id,
          content,
          created_at,
          profiles!inner (
            phone_number
          )
        `)
        .eq("profiles.phone_number", profile.phone_number)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.phone_number,
  });

  if (isLoadingProfile) {
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
            Phone: {profile.phone_number}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Stories</h2>
          </div>
          
          {isLoadingStories ? (
            <p className="text-muted-foreground">Loading stories...</p>
          ) : stories && stories.length > 0 ? (
            <div className="space-y-4">
              {stories.map((story) => (
                <div 
                  key={story.id} 
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <p className="whitespace-pre-wrap">{story.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No stories found for your phone number.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;