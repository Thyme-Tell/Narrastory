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

/**
 * Checks and fixes subscription data inconsistencies
 * 
 * @param email User's email address or profile ID
 * @param isEmail Whether the first parameter is an email (true) or a profile ID (false)
 * @returns True if fixes were applied, false otherwise
 */
export const checkAndFixSubscriptionData = async (emailOrId: string, isEmail = true): Promise<boolean> => {
  try {
    console.log(`Checking subscription data for ${isEmail ? 'email' : 'profile'}: ${emailOrId}`);
    
    // If we have an email, first find the profile ID
    let profileId: string | null = null;
    
    if (isEmail) {
      profileId = await findProfileIdByEmail(emailOrId);
      if (!profileId) {
        console.error(`No profile found for email: ${emailOrId}`);
        return false;
      }
    } else {
      profileId = emailOrId;
    }
    
    // Get the subscription data
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching subscription data:', error);
      return false;
    }
    
    if (!data) {
      console.log('No subscription data found to check.');
      return false;
    }
    
    // Check for inconsistencies
    let needsFix = false;
    const updates: any = {};
    
    // Check 1: Active status with free plan
    if ((data.status === 'active' || data.status === 'trialing') && data.plan_type === 'free') {
      console.log('Found inconsistency: Active subscription with free plan type.');
      updates.plan_type = 'monthly';
      needsFix = true;
    }
    
    // Check 2: Lifetime subscription with non-lifetime plan type
    if (data.is_lifetime && data.plan_type !== 'lifetime') {
      console.log('Found inconsistency: Lifetime flag true but plan type is not lifetime.');
      updates.plan_type = 'lifetime';
      needsFix = true;
    }
    
    // Apply fixes if needed
    if (needsFix && Object.keys(updates).length > 0) {
      console.log(`Applying fixes to subscription data: `, updates);
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('user_id', profileId);
        
      if (updateError) {
        console.error('Error updating subscription data:', updateError);
        return false;
      }
      
      // Invalidate any cached subscription data
      subscriptionService.invalidateCache(profileId);
      console.log('Subscription data fixed successfully.');
      return true;
    }
    
    console.log('No subscription data inconsistencies found.');
    return false;
  } catch (err) {
    console.error('Error in checkAndFixSubscriptionData:', err);
    return false;
  }
};

// Export a utility to run a comprehensive check for all subscription data
export const runSubscriptionDataIntegrityCheck = async (): Promise<{ checked: number, fixed: number }> => {
  try {
    console.log('Running subscription data integrity check for all users...');
    
    // Get all subscription records
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id, plan_type, is_lifetime, status')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching subscription data:', error);
      return { checked: 0, fixed: 0 };
    }
    
    if (!data || data.length === 0) {
      console.log('No subscription data to check.');
      return { checked: 0, fixed: 0 };
    }
    
    console.log(`Found ${data.length} subscription records to check.`);
    let fixedCount = 0;
    
    // Check each subscription
    for (const subscription of data) {
      const fixed = await checkAndFixSubscriptionData(subscription.user_id, false);
      if (fixed) fixedCount++;
    }
    
    console.log(`Subscription integrity check complete. Checked ${data.length}, fixed ${fixedCount}.`);
    return { checked: data.length, fixed: fixedCount };
  } catch (err) {
    console.error('Error in runSubscriptionDataIntegrityCheck:', err);
    return { checked: 0, fixed: 0 };
  }
};

// Function to add a helper to run the check from the Profile component
export const fixProfileSubscription = async (profileId: string): Promise<boolean> => {
  if (!profileId) return false;
  
  try {
    console.log(`Manually checking and fixing subscription for profile ${profileId}`);
    return await checkAndFixSubscriptionData(profileId, false);
  } catch (err) {
    console.error('Error fixing profile subscription:', err);
    return false;
  }
};
