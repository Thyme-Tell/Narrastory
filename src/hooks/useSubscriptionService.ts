
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/SubscriptionService';
import { 
  SubscriptionPlanChange,
  BookCreditUsage,
  UsageRecord,
  SubscriptionResponse,
  SubscriptionStatusResult
} from '@/types/subscription';

/**
 * Hook to interact with the subscription service
 * 
 * @param profileId User profile ID (optional)
 * @returns Subscription service operations and status
 */
export const useSubscriptionService = (profileId?: string) => {
  const queryClient = useQueryClient();
  
  // Query subscription status
  const { 
    data: subscriptionStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['subscription-status', profileId],
    queryFn: () => subscriptionService.getSubscriptionStatus(profileId),
    enabled: !!profileId,
  });

  // Mutation for plan change
  const changePlanMutation = useMutation({
    mutationFn: (planChange: SubscriptionPlanChange) => 
      subscriptionService.changePlan(planChange),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId] });
    },
  });

  // Mutation for using book credits
  const useBookCreditsMutation = useMutation({
    mutationFn: (bookUsage: BookCreditUsage) => 
      subscriptionService.useBookCredits(bookUsage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId] });
    },
  });

  // Mutation for tracking usage
  const trackUsageMutation = useMutation({
    mutationFn: (usage: UsageRecord) => 
      subscriptionService.trackUsage(usage),
  });

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
      subscription: null
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
    useBookCredits: useBookCreditsMutation.mutate,
    isUsingCredits: useBookCreditsMutation.isPending,
    creditError: useBookCreditsMutation.error,
    
    // Usage tracking
    trackUsage: trackUsageMutation.mutate,
    isTrackingUsage: trackUsageMutation.isPending,
    trackingError: trackUsageMutation.error,
    
    // Price calculation
    getPlanPrice: subscriptionService.getPlanPrice,
  };
};
