
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
 * @param forceRefresh Force a fresh check ignoring the cache (optional)
 * @returns Subscription service operations and status
 */
export const useSubscriptionService = (profileId?: string, forceRefresh = false) => {
  const queryClient = useQueryClient();
  
  // Query subscription status
  const { 
    data: subscriptionStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['subscription-status', profileId, forceRefresh],
    queryFn: () => subscriptionService.getSubscriptionStatus(profileId, forceRefresh),
    enabled: !!profileId,
    staleTime: forceRefresh ? 0 : 5 * 60 * 1000, // 5 minutes if not forcing refresh
  });

  // Mutation for plan change
  const changePlanMutation = useMutation({
    mutationFn: (planChange: SubscriptionPlanChange) => 
      subscriptionService.changePlan(planChange),
    onSuccess: () => {
      // Invalidate the subscription status cache
      subscriptionService.invalidateCache(profileId);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId] });
    },
  });

  // Mutation for using book credits
  const useBookCreditsMutation = useMutation({
    mutationFn: (bookUsage: BookCreditUsage): Promise<CreditResult> => 
      subscriptionService.useBookCredits(bookUsage),
    onSuccess: () => {
      // Invalidate the subscription status cache
      subscriptionService.invalidateCache(profileId);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId] });
    },
  });

  // Mutation for tracking usage
  const trackUsageMutation = useMutation({
    mutationFn: (usage: UsageRecord) => 
      subscriptionService.trackUsage(usage),
  });

  // Query to check if a user has access to a specific feature
  const checkFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!profileId) return false;
    return subscriptionService.hasFeatureAccess(profileId, featureName as any);
  };

  // Helper function to get formatted status data with defaults
  const getStatus = (): SubscriptionStatusResult => {
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

  return {
    // Status data
    status: getStatus(),
    isStatusLoading,
    statusError,
    refetchStatus,
    
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
      subscriptionService.invalidateCache(profileId);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId] });
    }
  };
};
