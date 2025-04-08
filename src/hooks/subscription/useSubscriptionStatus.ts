
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/SubscriptionService';
import { SubscriptionStatusResult } from '@/types/subscription';
import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';

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
      
      if (cookieEmail) {
        setEffectiveEmail(cookieEmail);
      } else if (cookieProfileId) {
        setEffectiveProfileId(cookieProfileId);
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
        // Show error toast only if not in development mode (to avoid spamming)
        if (process.env.NODE_ENV !== 'development') {
          toast({
            title: "Subscription Check Error",
            description: "There was an issue checking your subscription status. Using free tier access for now.",
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    enabled: !!effectiveProfileId || !!effectiveEmail,
    staleTime: 60000, // 1 minute stale time to reduce excessive fetching
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid excessive calls
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
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
        booksLimit: 1,
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
