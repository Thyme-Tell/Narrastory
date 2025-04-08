
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/SubscriptionService';
import { SubscriptionStatusResult } from '@/types/subscription';
import Cookies from 'js-cookie';

/**
 * Hook to get subscription status
 * 
 * @param profileId User profile ID (optional)
 * @param forceRefresh Force a fresh check ignoring the cache (optional, defaults to true)
 * @param email User email address (optional, takes precedence over profileId if provided)
 * @returns Subscription status and loading state
 */
export const useSubscriptionStatus = (
  profileId?: string, 
  forceRefresh: boolean = true,
  email?: string
) => {
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
    } else {
      // Update if they change
      setEffectiveProfileId(profileId);
      setEffectiveEmail(email);
    }
  }, [profileId, email]);

  // Query subscription status
  const { 
    data: subscriptionStatus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-status', effectiveProfileId, effectiveEmail, forceRefresh, Date.now()],
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

  // Helper function to get formatted status data with defaults
  const getStatus = (): SubscriptionStatusResult => {
    if (error) {
      console.error('Error in subscription status:', error);
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

  return {
    status: getStatus(),
    isStatusLoading: isLoading,
    statusError: error,
    refetchStatus: refetch,
    effectiveProfileId,
    effectiveEmail
  };
};
