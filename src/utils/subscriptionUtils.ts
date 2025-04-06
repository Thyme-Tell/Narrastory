
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
    console.log(`Checking subscription for email: ${email}`);
    
    // Use the updated service to get subscription directly by email
    const subscriptionStatus = await subscriptionService.getSubscriptionStatus(undefined, true, email);
    console.log('Subscription status from service:', subscriptionStatus);
    
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
  
  // Get subscription directly with email
  const subscription = await subscriptionService.getSubscriptionStatus(undefined, true, email);
  
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

// Function to manually set a user to have a lifetime subscription
// This is an admin utility function
export const setUserToLifetime = async (email: string): Promise<boolean> => {
  try {
    const profileId = await findProfileIdByEmail(email);
    if (!profileId) {
      console.error(`No user found with email: ${email}`);
      return false;
    }
    
    // Update or create a subscription record with lifetime settings
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: profileId,
        plan_type: 'lifetime',
        status: 'active',
        is_lifetime: true,
        book_credits: 1, // Give at least one book credit
        lifetime_purchase_date: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });
    
    if (error) {
      console.error('Error setting lifetime subscription:', error);
      return false;
    }
    
    console.log(`✅ Successfully set ${email} to lifetime subscription`);
    return true;
  } catch (err) {
    console.error('Error in setUserToLifetime:', err);
    return false;
  }
};
