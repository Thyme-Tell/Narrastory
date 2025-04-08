
import { subscriptionService } from '@/services/SubscriptionService';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for subscription feature access and utility functions
 * 
 * @param profileId User profile ID
 * @param email User email
 * @returns Feature access and utility functions
 */
export const useSubscriptionFeatures = (
  profileId?: string,
  email?: string
) => {
  const queryClient = useQueryClient();

  // Query to check if a user has access to a specific feature
  const checkFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!profileId && !email) return false;
    console.log(`Checking feature access for ${featureName} for profile ${profileId} or email ${email}`);
    return subscriptionService.hasFeatureAccess(profileId || '', featureName as any, email);
  };

  // Fetch subscription status immediately if needed
  const fetchSubscriptionStatus = async () => {
    console.log(`Manually fetching subscription status with: profileId=${profileId}, email=${email}`);
    try {
      await queryClient.invalidateQueries({ 
        queryKey: ['subscription-status', profileId, email] 
      });
    } catch (error) {
      console.error('Error manually fetching subscription status:', error);
    }
  };

  // Cache control
  const invalidateCache = () => {
    console.log(`Manually invalidating cache for profile ${profileId} or email ${email}`);
    subscriptionService.invalidateCache(profileId, email);
    queryClient.invalidateQueries({ queryKey: ['subscription-status', profileId, email] });
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
  };

  return {
    // Feature access
    checkFeatureAccess,
    
    // Plan details
    getPlanPrice: subscriptionService.getPlanPrice,
    getPlanDetails: subscriptionService.getPlanDetails,
    
    // Cache control
    invalidateCache,
    fetchSubscriptionStatus
  };
};
