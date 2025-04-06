
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const useSubscription = (profileId?: string) => {
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

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { profileId },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profileId,
  });

  return {
    subscription: data?.subscriptionData,
    isPremium: data?.isPremium || false,
    isLifetime: data?.isLifetime || false,
    hasActiveSubscription: data?.hasSubscription || false,
    isLoading,
    error,
    refetch,
  };
};
