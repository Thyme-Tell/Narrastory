import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import { BookProgress } from "@/components/BookProgress";
import { Menu, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
import { setUserToLifetime } from "@/utils/subscriptionUtils";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isBookExpanded, setIsBookExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Get profile data to extract email for subscription lookup
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
  
  // Now we get subscription status using email when available
  const { 
    status: subscriptionStatus, 
    isStatusLoading, 
    statusError, 
    fetchSubscriptionStatus 
  } = useSubscriptionService(id, false, profile?.email);

  useEffect(() => {
    console.log("Profile component mounted with profileId:", id);
    if (profile?.email) {
      console.log("Will fetch subscription using email:", profile.email);
    }
    if (id || profile?.email) {
      fetchSubscriptionStatus();
    }
  }, [id, profile?.email]);

  useEffect(() => {
    // Log subscription status for debugging
    console.log("Current subscription status:", subscriptionStatus);
    if (statusError) {
      console.error("Subscription status error:", statusError);
      toast.error("There was an issue loading subscription details");
    }
  }, [subscriptionStatus, statusError]);
  
  const handleRefreshSubscription = async () => {
    if (!profile?.email) return;
    
    setIsRefreshing(true);
    try {
      await fetchSubscriptionStatus(true);
      toast.success("Subscription status refreshed");
    } catch (error) {
      console.error("Error refreshing subscription:", error);
      toast.error("Failed to refresh subscription status");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Dev feature to manually set a user to lifetime for testing
  const handleSetToLifetime = async () => {
    if (!profile?.email) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to set ${profile.email} to a lifetime subscription? This is for testing only.`
    );
    
    if (confirmed) {
      try {
        const success = await setUserToLifetime(profile.email);
        if (success) {
          toast.success(`Set ${profile.email} to lifetime subscription`);
          await fetchSubscriptionStatus(true);
        } else {
          toast.error("Failed to set lifetime subscription");
        }
      } catch (error) {
        console.error("Error setting lifetime subscription:", error);
        toast.error("An error occurred while setting lifetime subscription");
      }
    }
  };

  if (!isValidUUID && !window.location.pathname.includes('/sign-in')) {
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Subscription</span>
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetToLifetime}
              className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
            >
              Set to Lifetime
            </Button>
          )}
          
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
                Not {profile.first_name}? Log Out
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
          
          {!isStatusLoading && !subscriptionStatus.isLifetime && !subscriptionStatus.isPremium && (
            <div className="my-4">
              <LifetimeOfferBanner profileId={id} />
            </div>
          )}
          
          <ProfileHeader 
            firstName={profile.first_name} 
            lastName={profile.last_name}
            profileId={profile.id}
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
          
          {!isStatusLoading && !subscriptionStatus.isPremium && stories && stories.length > 5 && (
            <div className="mt-6">
              <UpgradePrompt profileId={id} variant="card" />
            </div>
          )}
        </div>
      </div>
      
      {!isStatusLoading && !subscriptionStatus.isPremium && (
        <UpgradePrompt profileId={id} variant="floating" />
      )}
      
      <ScrollToTopButton />
    </div>
  );
};

export default Profile;
