
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/SubscriptionService';
import { 
  PlanType,
  SubscriptionPlanChange,
  BookCreditUsage,
  UsageRecord,
  SubscriptionResponse,
  SubscriptionStatusResult,
  CreditResult,
  PlanDetails
} from '@/types/subscription';

/**
 * Hook to interact with the subscription service
 * 
 * @param profileId User profile ID (optional)
 * @param email User email address (optional, takes precedence over profileId if provided)
 * @param forceRefresh Force a fresh check ignoring the cache (optional)
 * @returns Subscription service operations and status
 */
export const useSubscriptionService = (
  profileId?: string, 
  forceRefresh = false, 
  email?: string
) => {
  const queryClient = useQueryClient();
  
  // Query subscription status
  const { 
    data: subscriptionStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['subscription-status', profileId, email, forceRefresh],
    queryFn: async () => {
      console.log(`Fetching subscription status for profile: ${profileId}, email: ${email}, force refresh: ${forceRefresh}`);
      try {
        const result = await subscriptionService.getSubscriptionStatus(profileId, forceRefresh, email);
        console.log('Subscription status fetch result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        throw error;
      }
    },
    enabled: !!profileId || !!email,
    staleTime: forceRefresh ? 0 : 5 * 60 * 1000, // 5 minutes if not forcing refresh
    retry: 2, // Retry twice on failure
  });

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

  // Query to check if a user has access to a specific feature
  const checkFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!profileId && !email) return false;
    console.log(`Checking feature access for ${featureName} for profile ${profileId} or email ${email}`);
    return subscriptionService.hasFeatureAccess(profileId || '', featureName as any, email);
  };

  // Helper function to get formatted status data with defaults
  const getStatus = (): SubscriptionStatusResult => {
    if (statusError) {
      console.error('Error in subscription status:', statusError);
    }
    
    return subscriptionStatus || {
      isPremium: false,
      isLifetime: false,
      hasActiveSubscription: false,
      expirationDate: null,
      bookCredits: 0,
      status: null,
      planType: 'free',
      subscription: null,
      features: {
        storageLimit: 100,
        booksLimit: 0,
        collaboratorsLimit: 0,
        aiGeneration: false,
        customTTS: false,
        advancedEditing: false,
        prioritySupport: false
      }
    };
  };

  // Fetch subscription status immediately if needed
  const fetchSubscriptionStatus = async () => {
    if (profileId || email) {
      console.log(`Manually fetching subscription status for profile: ${profileId}, email: ${email}`);
      try {
        await refetchStatus();
      } catch (error) {
        console.error('Error manually fetching subscription status:', error);
      }
    }
  };

  return {
    // Status data
    status: getStatus(),
    isStatusLoading,
    statusError,
    refetchStatus,
    fetchSubscriptionStatus,
    
    // Plan operations
    changePlan: changePlanMutation.mutate,
    isChangingPlan: changePlanMutation.isPending,
    planChangeError: changePlanMutation.error,
    
    // Credit operations
    useBookCredits: useBookCreditsMutation.mutateAsync, // Use mutateAsync instead of mutate to get the Promise result
    isUsingCredits: useBookCreditsMutation.isPending,
    creditError: useBookCreditsMutation.error,
    
    // Usage tracking
    trackUsage: trackUsageMutation.mutate,
    isTrackingUsage: trackUsageMutation.isPending,
    trackingError: trackUsageMutation.error,
    
    // Feature access
    checkFeatureAccess,
    
    // Plan details
    getPlanPrice: subscriptionService.getPlanPrice,
    getPlanDetails: subscriptionService.getPlanDetails,
    
    // Cache control
    invalidateCache: () => {
      console.log(`Manually invalidating cache for profile ${profileId} or email ${email}`);
      subscriptionService.invalidateCache(profileId, email);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId, email] });
    }
  };
};
