import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import PasswordProtection from "@/components/PasswordProtection";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Storybooks from "@/components/Storybooks";

const Profile = () => {
  const { id } = useParams();
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("Profile ID from params:", id); // Debug log

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      console.log("Fetching profile for ID:", id); // Debug log
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at, password")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
        return null;
      }
      
      console.log("Profile data received:", data); // Debug log
      return data;
    },
  });

  const { data: stories, isLoading: isLoadingStories, error: storiesError, refetch: refetchStories } = useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      if (!id || !isVerified) return [];
      
      console.log("Fetching stories for profile:", id); // Debug log
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load stories",
        });
        return [];
      }
      
      console.log("Stories data received:", data); // Debug log
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
    console.log("Auth cookie value:", authCookie); // Debug log
    if (authCookie === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handlePasswordVerify = async (password: string) => {
    if (!profile) return false;
    
    console.log("Verifying password"); // Debug log
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

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Error loading profile</p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
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
            
            {profile && <Storybooks profileId={profile.id} />}
            
            <div className="mt-8">
              {storiesError ? (
                <p className="text-destructive">Error loading stories</p>
              ) : (
                <StoriesList 
                  stories={stories || []}
                  isLoading={isLoadingStories}
                  onUpdate={refetchStories}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;