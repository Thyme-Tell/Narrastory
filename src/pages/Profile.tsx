
import React, { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import { BookProgress } from "@/components/BookProgress";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isBookExpanded, setIsBookExpanded] = useState(false);
  
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      if (!isValidUUID) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, created_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: isValidUUID,
  });
  
  useEffect(() => {
    console.log("Profile component mounted with profileId:", id);
    if (profile?.email) {
      console.log("Profile email:", profile.email);
    }
  }, [id, profile?.email]);

  if (!isValidUUID && id !== undefined) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: stories, isLoading: isLoadingStories, refetch: refetchStories } = useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      if (!isValidUUID) return [];
      
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, share_token")
        .eq("profile_id", id)
        .order("created_at", { ascending: false });

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
    enabled: isValidUUID,
  });

  useEffect(() => {
    if (profile) {
      document.title = `Narra Story | ${profile.first_name}'s Profile`;
    } else {
      document.title = "Narra Story | Profile";
    }
  }, [profile]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    navigate('/');
  };

  const handleBookExpandToggle = (expanded: boolean) => {
    setIsBookExpanded(expanded);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile && isValidUUID) {
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-[24px] w-[24px] scale-[1.6]" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem onClick={handleLogout} className="text-[#A33D29]">
                Not {profile?.first_name}? Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-0">
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isBookExpanded ? '' : 'max-h-[30vh]'}`} 
            style={{ 
              minHeight: isBookExpanded ? "auto" : "120px" 
            }}
          >
            <BookProgress 
              profileId={id} 
              onExpandToggle={handleBookExpandToggle}
            />
          </div>
          
          <ProfileHeader 
            firstName={profile?.first_name || ''} 
            lastName={profile?.last_name || ''}
            profileId={profile?.id || ''}
            onUpdate={refetchStories}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
          
          <StoriesList 
            stories={stories || []}
            isLoading={isLoadingStories}
            onUpdate={refetchStories}
            sortOrder={sortOrder}
          />
        </div>
      </div>
      
      <ScrollToTopButton />
    </div>
  );
};

export default Profile;
