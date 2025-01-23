import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import PasswordProtection from "@/components/PasswordProtection";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Menu, Book } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { id } = useParams();
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (profile) {
      document.title = `Narra Story | ${profile.first_name}'s Profile`;
    } else {
      document.title = "Narra Story | Profile";
    }
  }, [profile]);

  useEffect(() => {
    const authCookie = Cookies.get('profile_authorized');
    if (authCookie === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handlePasswordVerify = async (password: string) => {
    if (!profile) return false;
    
    const isValid = profile.password === password;
    if (isValid) {
      setIsVerified(true);
    }
    return isValid;
  };

  const handleLogout = async () => {
    Cookies.remove('profile_authorized');
    navigate('/');
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
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url('/lovable-uploads/e730ede5-8b2e-436e-a398-0c62ea70f30c.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-12 w-12" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="text-[#A33D29]">
              Not {profile?.first_name}? Log Out
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/">
                Sign Up for Narra
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <ProfileHeader 
            firstName={profile?.first_name || ""} 
            lastName={profile?.last_name || ""} 
          />
          
          <div>
            <p className="text-muted-foreground mb-[15px]">
              Call Narra at <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a> to create a new story.
            </p>
            
            <Link 
              to={`/profile/${profile.id}/storybooks`}
              className="inline-flex items-center gap-2 mb-6 text-[#A33D29] hover:underline"
            >
              <Book className="h-5 w-5" />
              View Storybooks
            </Link>
            
            <div className="mt-8">
              <StoriesList 
                stories={stories || []}
                isLoading={isLoadingStories}
                onUpdate={refetchStories}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;