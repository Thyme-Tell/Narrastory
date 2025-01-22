import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const { data: stories, isLoading: isLoadingStories } = useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("stories")
        .select(`
          id,
          content,
          created_at
        `)
        .eq("profile_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!id,
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
        <div className="text-center space-y-4">
          <p className="text-lg">Profile not found</p>
          <Link to="/" className="text-primary hover:underline">
            Sign up for Narra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <Link 
            to="/" 
            className="text-primary hover:underline"
          >
            Not {profile.first_name}? Sign up
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Stories</h2>
          </div>
          
          <p className="text-muted-foreground">
            Call Narra at +1 (507) 200-3303 to create a new story.
          </p>
          
          {isLoadingStories ? (
            <p className="text-muted-foreground">Loading stories...</p>
          ) : stories && stories.length > 0 ? (
            <div className="space-y-4">
              {stories.map((story) => (
                <div 
                  key={story.id} 
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2"
                >
                  <p className="text-sm text-muted-foreground">
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap">{story.content}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile;