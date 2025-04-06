
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionStatusResult } from "@/types/subscription";
import { subscriptionService } from "@/services/SubscriptionService";

/**
 * Finds a user's profile ID by their email address
 * 
 * @param email User's email address
 * @returns User profile ID or null if not found
 */
export const findProfileIdByEmail = async (email: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error finding profile:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (err) {
    console.error('Error in profile lookup:', err);
    return null;
  }
};

/**
 * Check subscription status for a user by their email
 * 
 * @param email User's email address
 * @returns Subscription status information or null if user not found
 */
export const checkSubscriptionByEmail = async (email: string): Promise<SubscriptionStatusResult | null> => {
  try {
    const profileId = await findProfileIdByEmail(email);
    
    if (!profileId) {
      console.error(`No user found with email: ${email}`);
      return null;
    }
    
    const subscriptionStatus = await subscriptionService.getSubscriptionStatus(profileId);
    return subscriptionStatus;
  } catch (err) {
    console.error('Error checking subscription by email:', err);
    return null;
  }
};

/**
 * Console log a user's subscription details
 * This is a utility function for administrators to check user subscription status
 * 
 * @param email User's email address
 */
export const logUserSubscriptionDetails = async (email: string): Promise<void> => {
  console.log(`Checking subscription for user: ${email}`);
  
  const profileId = await findProfileIdByEmail(email);
  if (!profileId) {
    console.log(`❌ No user found with email: ${email}`);
    return;
  }
  
  console.log(`✅ Found user with profile ID: ${profileId}`);
  
  const subscription = await subscriptionService.getSubscriptionStatus(profileId);
  
  console.log('Subscription details:');
  console.log(`- Plan type: ${subscription.planType}`);
  console.log(`- Status: ${subscription.status || 'Not available'}`);
  console.log(`- Premium: ${subscription.isPremium ? 'Yes' : 'No'}`);
  console.log(`- Lifetime: ${subscription.isLifetime ? 'Yes' : 'No'}`);
  console.log(`- Active: ${subscription.hasActiveSubscription ? 'Yes' : 'No'}`);
  console.log(`- Book credits: ${subscription.bookCredits}`);
  
  if (subscription.expirationDate) {
    console.log(`- Expires: ${subscription.expirationDate.toLocaleDateString()}`);
  } else {
    console.log(`- Expires: N/A`);
  }
  
  console.log(`- Raw data: `, subscription.subscription);
};
