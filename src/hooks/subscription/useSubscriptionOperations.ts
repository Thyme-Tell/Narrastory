
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/SubscriptionService';
import { 
  SubscriptionPlanChange,
  BookCreditUsage,
  UsageRecord,
  CreditResult
} from '@/types/subscription';

/**
 * Hook for subscription operations like changing plans, using credits and tracking usage
 * 
 * @param profileId User profile ID
 * @param email User email 
 * @returns Subscription operations and their states
 */
export const useSubscriptionOperations = (
  profileId?: string,
  email?: string
) => {
  const queryClient = useQueryClient();

  // Mutation for plan change
  const changePlanMutation = useMutation({
    mutationFn: (planChange: SubscriptionPlanChange) => {
      console.log('Changing plan:', planChange);
      return subscriptionService.changePlan(planChange);
    },
    onSuccess: () => {
      // Invalidate the subscription status cache
      console.log(`Invalidating cache for profile ${profileId} after plan change`);
      subscriptionService.invalidateCache(profileId, email);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId, email] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    },
    onError: (error) => {
      console.error('Error changing plan:', error);
    }
  });

  // Mutation for using book credits
  const useBookCreditsMutation = useMutation({
    mutationFn: (bookUsage: BookCreditUsage): Promise<CreditResult> => {
      console.log('Using book credits:', bookUsage);
      return subscriptionService.useBookCredits(bookUsage);
    },
    onSuccess: () => {
      // Invalidate the subscription status cache
      console.log(`Invalidating cache for profile ${profileId} after using credits`);
      subscriptionService.invalidateCache(profileId, email);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId, email] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    },
    onError: (error) => {
      console.error('Error using book credits:', error);
    }
  });

  // Mutation for tracking usage
  const trackUsageMutation = useMutation({
    mutationFn: (usage: UsageRecord) => {
      console.log('Tracking usage:', usage);
      return subscriptionService.trackUsage(usage);
    },
    onError: (error) => {
      console.error('Error tracking usage:', error);
    }
  });

  return {
    // Plan operations
    changePlan: changePlanMutation.mutate,
    isChangingPlan: changePlanMutation.isPending,
    planChangeError: changePlanMutation.error,
    
    // Credit operations
    useBookCredits: useBookCreditsMutation.mutateAsync,
    isUsingCredits: useBookCreditsMutation.isPending,
    creditError: useBookCreditsMutation.error,
    
    // Usage tracking
    trackUsage: trackUsageMutation.mutate,
    isTrackingUsage: trackUsageMutation.isPending,
    trackingError: trackUsageMutation.error,
  };
};
