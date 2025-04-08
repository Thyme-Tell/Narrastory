import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PRODUCTS } from "@/hooks/useStripeCheckout";
import { toast } from "@/hooks/use-toast";
import { 
  PlanType,
  SubscriptionPlanChange,
  BookCreditUsage,
  UsageRecord,
  SubscriptionResponse,
  CreditResult,
  UsageResult,
  SubscriptionChangeResult,
  SubscriptionStatusResult,
  SubscriptionStatus,
  PLAN_DETAILS,
  PLAN_FEATURES
} from "@/types/subscription";
import { SubscriptionData } from "@/hooks/useSubscription";

/**
 * Subscription Service
 * 
 * Manages all subscription-related operations including:
 * - Plan changes
 * - Credit management
 * - Usage tracking
 * - Status verification
 * - Feature entitlements
 */
class SubscriptionService {
  // Cache for subscription status to minimize API calls - now disabled
  private statusCache: Map<string, { 
    status: SubscriptionStatusResult, 
    timestamp: number
  }> = new Map();
  
  // Cache TTL in milliseconds (set to 0 to effectively disable caching)
  private cacheTtlMs = 0;
  
  /**
   * Get current subscription status for a user
   * 
   * @param profileId User profile ID
   * @param forceRefresh Force a fresh check ignoring the cache
   * @param email User email (takes precedence over profileId if provided)
   * @returns Subscription status information
   */
  async getSubscriptionStatus(
    profileId?: string, 
    forceRefresh = true, // Always force refresh by default
    email?: string
  ): Promise<SubscriptionStatusResult> {
    // Exit early if no identifiers provided
    if (!profileId && !email) {
      console.log('No profile ID or email provided - returning default subscription status');
      return this.getDefaultSubscriptionStatus();
    }

    // Always force a refresh and bypass cache to check with Stripe directly
    forceRefresh = true;

    // Create a cache key based on the available identifiers
    const cacheKey = email ? `email:${email}` : `profile:${profileId}`;

    try {
      console.log(`Fetching fresh subscription status for ${cacheKey}, forceRefresh=${forceRefresh}`);
      
      // Add a timeout for the Edge Function call to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          body: { 
            profileId, 
            email,
            forceRefresh: true // Always send forceRefresh=true to the edge function
          },
          // Remove the signal property as it's not supported in FunctionInvokeOptions
        });
  
        clearTimeout(timeoutId); // Clear the timeout if successful
  
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: "Subscription Check Failed",
            description: "Could not verify your subscription status. Please try again.",
            variant: "destructive",
          });
          return this.getDefaultSubscriptionStatus();
        }
  
        // Log raw response for debugging
        console.log('Raw subscription response from edge function:', data);
  
        // Extract subscription data and status
        const subscriptionData = data?.subscriptionData;
        const isPremium = data?.isPremium || false;
        const isLifetime = data?.isLifetime || false;
        const hasActiveSubscription = data?.hasSubscription || false;
        const planType = data?.planType || 'free';
        
        console.log(`Subscription status processed: isPremium=${isPremium}, planType=${planType}`);
        
        // Expiration date (if applicable)
        // For lifetime subscriptions, there is no expiration
        const expirationDate = isLifetime ? null : 
          (subscriptionData?.current_period_end ? new Date(subscriptionData.current_period_end) : null);
        
        // Credits information
        const bookCredits = subscriptionData?.book_credits || 0;
        
        // Status information
        const status = subscriptionData?.status as SubscriptionStatus | null;
        
        // Additional data from the enhanced edge function
        const features = data?.features || PLAN_FEATURES[planType as PlanType] || PLAN_FEATURES.free;
        const cancelAtPeriodEnd = data?.cancelAtPeriodEnd || false;
        const lastPaymentStatus = data?.lastPaymentStatus || null;
        const purchaseDate = data?.purchaseDate ? new Date(data.purchaseDate) : null;
        const orderId = data?.orderId || null;
  
        // Create the subscription status result
        const result: SubscriptionStatusResult = {
          isPremium,
          isLifetime,
          hasActiveSubscription,
          expirationDate,
          bookCredits,
          status,
          planType: planType as PlanType,
          features,
          cancelAtPeriodEnd,
          lastPaymentStatus,
          purchaseDate,
          orderId,
          subscription: subscriptionData
        };
        
        // We no longer cache the result - always use fresh data
        console.log(`Subscription status fetch result:`, result);
  
        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId); // Clear the timeout on error
        console.error('Edge Function fetch error:', fetchError);
        
        // If the fetch fails, return the default status
        return this.getDefaultSubscriptionStatus();
      }
    } catch (err) {
      console.error('Error in subscription status check:', err);
      toast({
        title: "Subscription Error",
        description: "An error occurred while checking your subscription.",
        variant: "destructive",
      });
      return this.getDefaultSubscriptionStatus();
    }
  }

  /**
   * Invalidate the subscription status cache for a user
   * 
   * @param profileId User profile ID
   * @param email User email
   */
  invalidateCache(profileId?: string, email?: string): void {
    if (email) {
      this.statusCache.delete(`email:${email}`);
      console.log(`Invalidated subscription cache for email ${email}`);
    }
    
    if (profileId) {
      this.statusCache.delete(`profile:${profileId}`);
      console.log(`Invalidated subscription cache for profile ${profileId}`);
    }
  }

  /**
   * Create a checkout session for a subscription plan change
   * 
   * @param planChange Plan change information
   * @returns Result of the plan change operation
   */
  async changePlan(planChange: SubscriptionPlanChange): Promise<SubscriptionChangeResult> {
    try {
      const { fromPlan, toPlan, userId } = planChange;
      
      // Validate the plan change
      if (!this.isValidPlanChange(fromPlan, toPlan)) {
        return {
          success: false,
          message: "Invalid plan change requested. Please contact support."
        };
      }

      // Get the appropriate price ID for the new plan
      let priceId: string;
      if (toPlan === 'monthly') {
        priceId = 'MONTHLY_PREMIUM';
      } else if (toPlan === 'annual' || toPlan === 'plus') {
        priceId = 'ANNUAL_PLUS';
      } else if (toPlan === 'lifetime') {
        priceId = 'LIFETIME';
      } else {
        // For downgrades to free plan, we need to cancel the subscription
        return await this.cancelSubscription(userId);
      }

      // Invalidate the cache for this user
      this.invalidateCache(userId);

      // Create a checkout session for the new plan
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          profileId: userId,
          successUrl: `${window.location.origin}/profile/${userId}?plan_changed=true`,
          cancelUrl: `${window.location.origin}/profile/${userId}?plan_change_canceled=true`,
        },
      });

      if (error) {
        console.error('Error creating checkout for plan change:', error);
        return {
          success: false,
          message: "Failed to initiate plan change. Please try again later.",
          error
        };
      }

      // Redirect to the checkout page
      if (data?.url) {
        window.location.href = data.url;
        return {
          success: true,
          newPlan: toPlan,
          message: "Redirecting to checkout page for your new plan."
        };
      }

      return {
        success: false,
        message: "Could not generate checkout link. Please try again."
      };
    } catch (err) {
      console.error('Error in plan change:', err);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        error: err
      };
    }
  }

  /**
   * Cancel a subscription
   * 
   * @param userId User ID
   * @returns Result of the cancellation
   */
  async cancelSubscription(userId: string): Promise<SubscriptionChangeResult> {
    try {
      // Call the function to cancel the subscription
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { profileId: userId },
      });

      // Invalidate the cache for this user
      this.invalidateCache(userId);

      if (error) {
        console.error('Error canceling subscription:', error);
        return {
          success: false,
          message: "Failed to cancel subscription. Please try again later.",
          error
        };
      }

      return {
        success: true,
        newPlan: 'free',
        message: "Your subscription has been canceled. You will have access until the end of your billing period."
      };
    } catch (err) {
      console.error('Error in subscription cancellation:', err);
      return {
        success: false,
        message: "An unexpected error occurred while canceling your subscription.",
        error: err
      };
    }
  }

  /**
   * Use book credits
   * 
   * @param bookUsage Book credit usage information
   * @returns Result of the operation with remaining credits
   */
  async useBookCredits(bookUsage: BookCreditUsage): Promise<CreditResult> {
    try {
      const { profileId, bookId, amount } = bookUsage;
      
      // Get current subscription status to check available credits
      const status = await this.getSubscriptionStatus(profileId, true);
      
      if (status.bookCredits < amount) {
        return {
          success: false,
          remainingCredits: status.bookCredits,
          message: `Insufficient credits. You have ${status.bookCredits} credits, but need ${amount}.`
        };
      }

      // Track the usage
      const metadata: Record<string, unknown> = {};
      if (bookId) {
        metadata.bookId = bookId;
      }

      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: {
          profileId,
          featureType: 'book',
          amount,
          metadata
        },
      });

      // Invalidate the cache for this user
      this.invalidateCache(profileId);

      if (error) {
        console.error('Error using book credits:', error);
        return {
          success: false,
          remainingCredits: status.bookCredits,
          message: "Failed to use book credits. Please try again.",
          error
        };
      }

      return {
        success: true,
        remainingCredits: data.remainingCredits,
        message: `Successfully used ${amount} book credit(s). You have ${data.remainingCredits} credits remaining.`
      };
    } catch (err) {
      console.error('Error in book credit usage:', err);
      return {
        success: false,
        remainingCredits: 0,
        message: "An unexpected error occurred while using book credits.",
        error: err
      };
    }
  }

  /**
   * Track usage of premium features
   * 
   * @param usage Usage record information
   * @returns Result of the usage tracking operation
   */
  async trackUsage(usage: UsageRecord): Promise<UsageResult> {
    try {
      const { profileId, featureType, amount, metadata } = usage;
      
      // Call the track-usage edge function
      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: {
          profileId,
          featureType,
          amount,
          metadata: metadata || {}
        },
      });

      if (error) {
        console.error(`Error tracking ${featureType} usage:`, error);
        return {
          success: false,
          message: `Failed to track ${featureType} usage. Please try again.`,
          error
        };
      }

      return {
        success: true,
        message: `Successfully tracked ${amount} ${featureType} usage.`
      };
    } catch (err) {
      console.error('Error in usage tracking:', err);
      return {
        success: false,
        message: "An unexpected error occurred while tracking usage.",
        error: err
      };
    }
  }

  /**
   * Verify if a user has access to a specific feature
   * 
   * @param profileId User profile ID
   * @param featureName Name of the feature to check
   * @param email User email (optional)
   * @returns Whether the user has access to the feature
   */
  async hasFeatureAccess(
    profileId: string, 
    featureName: keyof typeof PLAN_FEATURES.free,
    email?: string
  ): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus(profileId, false, email);
      
      // If features are available in the status, check there
      if (status.features && featureName in status.features) {
        return Boolean(status.features[featureName]);
      }
      
      // Fallback to checking based on plan type
      const planType = status.planType;
      const features = PLAN_FEATURES[planType];
      
      return Boolean(features[featureName]);
    } catch (err) {
      console.error(`Error checking feature access for ${featureName}:`, err);
      // Default to not having access in case of error
      return false;
    }
  }

  /**
   * Get usage limits for a user based on their subscription plan
   * 
   * @param profileId User profile ID
   * @param limit Name of the limit to check
   * @returns The usage limit value
   */
  async getUsageLimit(profileId: string, limit: 'storageLimit' | 'booksLimit' | 'collaboratorsLimit'): Promise<number> {
    try {
      const status = await this.getSubscriptionStatus(profileId);
      
      // If features are available in the status, check there
      if (status.features && limit in status.features) {
        return status.features[limit] as number;
      }
      
      // Fallback to checking based on plan type
      const planType = status.planType;
      const features = PLAN_FEATURES[planType];
      
      return features[limit];
    } catch (err) {
      console.error(`Error checking usage limit for ${limit}:`, err);
      // Return default free tier limit in case of error
      return PLAN_FEATURES.free[limit];
    }
  }

  /**
   * Calculate the price for a plan
   * 
   * @param planType The subscription plan type
   * @returns Price details object
   */
  getPlanPrice(planType: PlanType): number {
    return PLAN_DETAILS[planType]?.price || 0;
  }

  /**
   * Get full details for a plan
   * 
   * @param planType The subscription plan type
   * @returns Plan details object
   */
  getPlanDetails(planType: PlanType) {
    return PLAN_DETAILS[planType] || PLAN_DETAILS.free;
  }

  /**
   * Check if a plan change is valid
   * 
   * @param fromPlan Current plan
   * @param toPlan Destination plan
   * @returns Whether the plan change is valid
   */
  private isValidPlanChange(fromPlan: PlanType, toPlan: PlanType): boolean {
    // Cannot change to the same plan
    if (fromPlan === toPlan) {
      return false;
    }
    
    // Cannot downgrade from lifetime
    if (fromPlan === 'lifetime' && toPlan !== 'lifetime') {
      return false;
    }
    
    return true;
  }

  /**
   * Get default subscription status for non-subscribed users
   * 
   * @returns Default subscription status
   */
  private getDefaultSubscriptionStatus(): SubscriptionStatusResult {
    console.log('Returning default subscription status (free plan)');
    return {
      isPremium: false,
      isLifetime: false,
      hasActiveSubscription: false,
      expirationDate: null,
      bookCredits: 0,
      status: null,
      planType: 'free',
      features: PLAN_FEATURES.free,
      subscription: null
    };
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService();
