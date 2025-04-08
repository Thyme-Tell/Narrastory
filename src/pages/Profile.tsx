
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
import LifetimeOfferBanner from "@/components/subscription/LifetimeOfferBanner";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import { useSubscriptionService } from "@/hooks/useSubscriptionService";
import { toast } from "sonner";
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
  
  const { 
    status: subscriptionStatus, 
    isStatusLoading, 
    statusError, 
    fetchSubscriptionStatus 
  } = useSubscriptionService(id, true, profile?.email);

  useEffect(() => {
    console.log("Profile component mounted with profileId:", id);
    if (profile?.email) {
      console.log("Will fetch subscription using email:", profile.email);
    }
    if (id || profile?.email) {
      fetchSubscriptionStatus();
    }
  }, [id, profile?.email, fetchSubscriptionStatus]);

  useEffect(() => {
    console.log("Current subscription status:", subscriptionStatus);
    if (statusError) {
      console.error("Subscription status error:", statusError);
      toast.error("There was an issue loading subscription details");
    }
  }, [subscriptionStatus, statusError]);

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

  const shouldShowUpgradePrompts = () => {
    if (isStatusLoading) {
      console.log("Not showing prompts because subscription data is loading");
      return false;
    }
    
    // Don't show upgrade prompts if the user has any kind of premium access
    const isPremium = subscriptionStatus.isPremium;
    const isLifetime = subscriptionStatus.isLifetime;
    const hasActiveSubscription = subscriptionStatus.hasActiveSubscription;
    const isFree = subscriptionStatus.planType === 'free';
    
    console.log(
      `Subscription flags: isFree=${isFree}, isPremium=${isPremium}, ` +
      `isLifetime=${isLifetime}, hasActiveSubscription=${hasActiveSubscription}`
    );
    
    // Only show upgrade prompts for free users with no premium features
    const shouldShow = isFree && !isPremium && !isLifetime && !hasActiveSubscription;
    console.log(`Upgrade prompts should show: ${shouldShow}`);
    
    return shouldShow;
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

  const showPrompts = shouldShowUpgradePrompts();

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
              <DropdownMenuItem asChild>
                <Link to={`/subscription/${id}`} className="w-full">
                  Subscription Settings
                </Link>
              </DropdownMenuItem>
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
          
          {showPrompts && (
            <div className="my-4">
              <LifetimeOfferBanner profileId={id} />
            </div>
          )}
          
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
          
          {showPrompts && stories && stories.length > 5 && (
            <div className="mt-6">
              <UpgradePrompt profileId={id} variant="card" />
            </div>
          )}
        </div>
      </div>
      
      {showPrompts && (
        <UpgradePrompt profileId={id} variant="floating" />
      )}
      
      <ScrollToTopButton />
    </div>
  );
};

export default Profile;
