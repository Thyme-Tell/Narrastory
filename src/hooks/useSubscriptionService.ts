import { useState, useEffect } from 'react';
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
import Cookies from 'js-cookie';

/**
 * Hook to interact with the subscription service
 * 
 * @param profileId User profile ID (optional)
 * @param forceRefresh Force a fresh check ignoring the cache (optional, defaults to true)
 * @param email User email address (optional, takes precedence over profileId if provided)
 * @returns Subscription service operations and status
 */
export const useSubscriptionService = (
  profileId?: string, 
  forceRefresh: boolean = true, // Default to true to ALWAYS force refresh
  email?: string
) => {
  const queryClient = useQueryClient();
  const [effectiveProfileId, setEffectiveProfileId] = useState<string | undefined>(profileId);
  const [effectiveEmail, setEffectiveEmail] = useState<string | undefined>(email);
  
  // Try to get profileId/email from cookies if not provided
  useEffect(() => {
    if (!profileId && !email) {
      const cookieProfileId = Cookies.get('profile_id');
      const cookieEmail = Cookies.get('user_email');
      
      console.log("Subscription service using cookies:", { cookieProfileId, cookieEmail });
      
      if (cookieProfileId) {
        setEffectiveProfileId(cookieProfileId);
      }
      
      if (cookieEmail) {
        setEffectiveEmail(cookieEmail);
      }
    }
  }, [profileId, email]);
  
  // Query subscription status
  const { 
    data: subscriptionStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['subscription-status', effectiveProfileId, effectiveEmail, forceRefresh],
    queryFn: async () => {
      console.log(`Fetching subscription status for profile: ${effectiveProfileId}, email: ${effectiveEmail}, force refresh: ${forceRefresh}`);
      try {
        // Use the provided forceRefresh value or default to true
        const result = await subscriptionService.getSubscriptionStatus(effectiveProfileId, forceRefresh, effectiveEmail);
        console.log('Subscription status fetch result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        throw error;
      }
    },
    enabled: !!effectiveProfileId || !!effectiveEmail,
    staleTime: 0, // Set stale time to 0 to always refetch
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
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
      console.log(`Invalidating cache for profile ${effectiveProfileId} after plan change`);
      subscriptionService.invalidateCache(effectiveProfileId, effectiveEmail);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', effectiveProfileId, effectiveEmail] });
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
      console.log(`Invalidating cache for profile ${effectiveProfileId} after using credits`);
      subscriptionService.invalidateCache(effectiveProfileId, effectiveEmail);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', effectiveProfileId, effectiveEmail] });
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
    if (!effectiveProfileId && !effectiveEmail) return false;
    console.log(`Checking feature access for ${featureName} for profile ${effectiveProfileId} or email ${effectiveEmail}`);
    return subscriptionService.hasFeatureAccess(effectiveProfileId || '', featureName as any, effectiveEmail);
  };

  // Helper function to get formatted status data with defaults
  const getStatus = (): SubscriptionStatusResult => {
    if (statusError) {
      console.error('Error in subscription status:', statusError);
    }
    
    // Make sure to log the status we're returning
    const status = subscriptionStatus || {
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
    
    console.log("Current subscription status:", status);
    return status;
  };

  // Fetch subscription status immediately if needed
  const fetchSubscriptionStatus = async () => {
    console.log(`Manually fetching subscription status with: profileId=${effectiveProfileId}, email=${effectiveEmail}`);
    try {
      await refetchStatus();
    } catch (error) {
      console.error('Error manually fetching subscription status:', error);
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
      console.log(`Manually invalidating cache for profile ${effectiveProfileId} or email ${effectiveEmail}`);
      subscriptionService.invalidateCache(effectiveProfileId, effectiveEmail);
      queryClient.invalidateQueries({ queryKey: ['subscription-status', effectiveProfileId, effectiveEmail] });
    }
  };
};
