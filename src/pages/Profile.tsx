import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import PasswordProtection from "@/components/PasswordProtection";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const Profile = () => {
  const { id } = useParams();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check for existing authorization cookie
    const authCookie = Cookies.get('profile_authorized');
    if (authCookie === 'true') {
      setIsVerified(true);
    }
  }, []);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at, password")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const { data: stories, isLoading: isLoadingStories, refetch: refetchStories } = useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      if (!id || !isVerified) return [];
      
      const { data, error } = await supabase
        .from("stories")
        .select(`
          id,
          title,
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
    enabled: !!id && isVerified,
  });

  const handlePasswordVerify = async (password: string) => {
    if (!profile) return false;
    
    const isValid = profile.password === password;
    if (isValid) {
      setIsVerified(true);
    }
    return isValid;
  };

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

  if (!isVerified) {
    return <PasswordProtection onVerify={handlePasswordVerify} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileHeader 
          firstName={profile.first_name} 
          lastName={profile.last_name} 
        />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Stories</h2>
          </div>
          
          <p className="text-muted-foreground">
            Call Narra at +1 (507) 200-3303 to create a new story.
          </p>
          
          <StoriesList 
            stories={stories || []}
            isLoading={isLoadingStories}
            onUpdate={refetchStories}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;