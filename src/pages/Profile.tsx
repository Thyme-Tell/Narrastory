
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import { BookProgress } from "@/components/BookProgress";
import { Menu, Crown, ChevronRight, Info } from "lucide-react";
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
import { PlanType } from "@/types/subscription";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isBookExpanded, setIsBookExpanded] = useState(false);
  
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
  
  const getPlanLabel = (planType: PlanType): string => {
    switch (planType) {
      case 'lifetime':
        return 'Lifetime';
      case 'annual':
      case 'plus':
        return 'Premium Annual';
      case 'monthly':
        return 'Premium Monthly';
      default:
        return 'Free Plan';
    }
  };
  
  const renderPlanFeatures = () => {
    const features = subscriptionStatus.features;
    if (!features) return null;
    
    return (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-semibold">Storage:</p>
            <p>{features.storageLimit} MB</p>
          </div>
          <div>
            <p className="font-semibold">Books:</p>
            <p>{features.booksLimit}</p>
          </div>
          <div>
            <p className="font-semibold">Collaborators:</p>
            <p>{features.collaboratorsLimit}</p>
          </div>
          <div>
            <p className="font-semibold">Priority Support:</p>
            <p>{features.prioritySupport ? 'Yes' : 'No'}</p>
          </div>
        </div>
        <div className="pt-1">
          <p className="font-semibold">Additional Features:</p>
          <ul className="list-disc pl-5 mt-1">
            {features.aiGeneration && <li>AI Generation</li>}
            {features.customTTS && <li>Custom Text-to-Speech</li>}
            {features.advancedEditing && <li>Advanced Editing</li>}
          </ul>
        </div>
      </div>
    );
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
        <div className="flex items-center gap-3">
          {/* Subscription Status Badge with HoverCard */}
          {!isStatusLoading && (
            <div className="flex items-center">
              {subscriptionStatus.isPremium ? (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="bg-[#EDF6FF] text-[#4B88DD] border border-[#D0E4FA] px-3 py-1 rounded-full flex items-center gap-1.5 cursor-help">
                      <Crown className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{getPlanLabel(subscriptionStatus.planType)}</span>
                      <Info className="h-3.5 w-3.5 ml-0.5 opacity-70" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Your {getPlanLabel(subscriptionStatus.planType)} Benefits</h4>
                      {renderPlanFeatures()}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white rounded-full flex items-center gap-1 pr-1.5"
                      asChild
                    >
                      <Link to={`/subscribe/${id}`}>
                        Upgrade
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Free Plan Limitations</h4>
                      {renderPlanFeatures()}
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground">Upgrade for additional features and higher limits</p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
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
