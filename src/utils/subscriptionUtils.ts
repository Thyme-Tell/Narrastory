
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
    const profileId = await findProfileIdByEmail(email);
    
    if (!profileId) {
      console.error(`No user found with email: ${email}`);
      return null;
    }
    
    console.log(`Found profile ID for ${email}: ${profileId}`);
    
    // Directly query the subscriptions table for this user first
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .maybeSingle();
    
    if (subscriptionError) {
      console.error('Error fetching subscription data directly:', subscriptionError);
    }
    
    if (subscriptionData) {
      console.log('Raw subscription data from database:', subscriptionData);
      
      // Special handling for lifetime subscriptions - make sure they are always active
      if (subscriptionData.is_lifetime) {
        console.log('User has lifetime subscription - ensuring active status');
        if (subscriptionData.status !== 'active') {
          // Update to make sure lifetime subscriptions are always active
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('user_id', profileId);
            
          if (updateError) {
            console.error('Error updating lifetime subscription status:', updateError);
          }
        }
      }
    }
    
    // Get the subscription status through the service
    const subscriptionStatus = await subscriptionService.getSubscriptionStatus(profileId);
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
  
  const profileId = await findProfileIdByEmail(email);
  if (!profileId) {
    console.log(`❌ No user found with email: ${email}`);
    return;
  }
  
  console.log(`✅ Found user with profile ID: ${profileId}`);
  
  // First, log the raw database entry
  const { data: rawSubscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', profileId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching raw subscription data:', error);
  } else {
    console.log('Raw subscription data from database:', rawSubscription);
  }
  
  // Then get formatted subscription data
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

