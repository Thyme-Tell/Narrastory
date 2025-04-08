
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionData {
  id: string;
  user_id: string;
  plan_type: 'free' | 'plus' | 'lifetime';
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  book_credits: number;
  minutes_used: number;
  is_lifetime: boolean;
  lifetime_purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionResponse {
  hasSubscription: boolean;
  isPremium: boolean;
  isLifetime: boolean;
  subscriptionData: SubscriptionData | null;
}

/**
 * Hook to query and monitor a user's subscription status
 * 
 * @param profileId The user's profile ID
 * @returns Subscription status and data
 */
export const useSubscription = (profileId?: string) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', profileId],
    queryFn: async (): Promise<SubscriptionResponse> => {
      if (!profileId) {
        return {
          hasSubscription: false,
          isPremium: false,
          isLifetime: false,
          subscriptionData: null,
        };
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          body: { profileId },
        });

        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: "Subscription Check Failed",
            description: "Could not verify your subscription status. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Error in subscription check:', err);
        toast({
          title: "Subscription Error",
          description: "An error occurred while checking your subscription.",
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: !!profileId,
  });

  // Derived subscription values for easier usage
  const isPremium = data?.isPremium || false;
  const isLifetime = data?.isLifetime || false;
  const hasActiveSubscription = data?.hasSubscription || false;
  
  // Expiration date (if applicable)
  const expirationDate = data?.subscriptionData?.current_period_end 
    ? new Date(data.subscriptionData.current_period_end) 
    : null;
  
  // Credits information
  const bookCredits = data?.subscriptionData?.book_credits || 0;
  
  // Status information
  const status = data?.subscriptionData?.status || null;
  const planType = data?.subscriptionData?.plan_type || 'free';

  return {
    subscription: data?.subscriptionData,
    isPremium,
    isLifetime,
    hasActiveSubscription,
    expirationDate,
    bookCredits,
    status,
    planType,
    isLoading,
    error,
    refetch,
  };
};
