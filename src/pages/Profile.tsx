import React from "react";
import { useParams } from "react-router-dom";
import { PlanType } from "@/types/subscription";
import { useSubscriptionService } from "@/hooks/useSubscriptionService";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const { status: subscriptionStatus } = useSubscriptionService(id);

  const getPlanLabel = (planType: PlanType): string => {
    if (!subscriptionStatus.isPremium) {
      return 'Free Plan';
    }
    
    switch (planType) {
      case 'lifetime':
        return 'Narra+';
      case 'annual':
      case 'plus':
        return 'Narra+';
      case 'monthly':
        return 'Narra+';
      default:
        return 'Narra+';
    }
  };

  return (
    <div>
      {/* Subscription Status Badge or Upgrade Button */}
      <div className="absolute top-4 right-4 flex items-center">
        {subscriptionStatus.isPremium ? (
          <HoverCard>
            <HoverCardTrigger>
              <Badge 
                variant="outline" 
                className="bg-green-100 text-green-800 border-green-200 cursor-pointer px-3 py-1"
              >
                {getPlanLabel(subscriptionStatus.planType)}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Your Premium Benefits</h4>
                <ul className="text-sm space-y-1">
                  <li>Storage: {subscriptionStatus.features?.storageLimit} MB</li>
                  <li>Books: {subscriptionStatus.features?.booksLimit}</li>
                  <li>Collaborators: {subscriptionStatus.features?.collaboratorsLimit}</li>
                  <li>AI Generation: {subscriptionStatus.features?.aiGeneration ? 'Yes' : 'No'}</li>
                  <li>Custom TTS: {subscriptionStatus.features?.customTTS ? 'Yes' : 'No'}</li>
                  <li>Advanced Editing: {subscriptionStatus.features?.advancedEditing ? 'Yes' : 'No'}</li>
                  <li>Priority Support: {subscriptionStatus.features?.prioritySupport ? 'Yes' : 'No'}</li>
                </ul>
                {subscriptionStatus.expirationDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews: {new Date(subscriptionStatus.expirationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <HoverCard>
            <HoverCardTrigger>
              <Button 
                size="sm" 
                className="rounded-full" 
                onClick={() => window.location.href = '/subscribe'}
              >
                Upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Upgrade to Narra+</h4>
                <p className="text-sm text-muted-foreground">Get more storage, unlimited books, AI generation, custom voices, and more!</p>
                <ul className="text-sm space-y-1">
                  <li>Increased Storage (up to 10GB)</li>
                  <li>Unlimited Books</li>
                  <li>Advanced AI Features</li>
                  <li>Custom Voice Support</li>
                  <li>Priority Customer Support</li>
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    </div>
  );
};

export default Profile;
