
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { useSubscriptionOperations } from './useSubscriptionOperations';
import { useSubscriptionFeatures } from './useSubscriptionFeatures';

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
  forceRefresh: boolean = true,
  email?: string
) => {
  // Get subscription status
  const { 
    status, 
    isStatusLoading, 
    statusError, 
    refetchStatus,
    effectiveProfileId,
    effectiveEmail
  } = useSubscriptionStatus(profileId, forceRefresh, email);

  // Get subscription operations
  const {
    changePlan,
    isChangingPlan,
    planChangeError,
    useBookCredits,
    isUsingCredits,
    creditError,
    trackUsage,
    isTrackingUsage,
    trackingError
  } = useSubscriptionOperations(effectiveProfileId, effectiveEmail);

  // Get subscription features and utilities
  const {
    checkFeatureAccess,
    getPlanPrice,
    getPlanDetails,
    invalidateCache,
    fetchSubscriptionStatus
  } = useSubscriptionFeatures(effectiveProfileId, effectiveEmail);

  return {
    // Status data
    status,
    isStatusLoading,
    statusError,
    refetchStatus,
    fetchSubscriptionStatus,
    
    // Plan operations
    changePlan,
    isChangingPlan,
    planChangeError,
    
    // Credit operations
    useBookCredits,
    isUsingCredits,
    creditError,
    
    // Usage tracking
    trackUsage,
    isTrackingUsage,
    trackingError,
    
    // Feature access
    checkFeatureAccess,
    
    // Plan details
    getPlanPrice,
    getPlanDetails,
    
    // Cache control
    invalidateCache
  };
};
