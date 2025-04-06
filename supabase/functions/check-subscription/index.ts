
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";

/**
 * Check Subscription Edge Function
 * 
 * Checks a user's subscription status in the database.
 * 
 * Request:
 * - profileId: string (user profile ID) - via query param or request body
 * 
 * Response:
 * - hasSubscription: boolean (whether user has active subscription)
 * - isPremium: boolean (whether user has premium status)
 * - isLifetime: boolean (whether user has lifetime subscription)
 * - subscriptionData: object (full subscription data if available)
 */
serve(async (req) => {
  console.log("Check subscription function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body or query parameters
    const url = new URL(req.url);
    let profileId = url.searchParams.get('profileId');
    console.log(`Profile ID from query: ${profileId}`);

    // If profile ID not in query params, try to get from request body
    if (!profileId) {
      try {
        const body = await req.json();
        profileId = body.profileId;
        console.log(`Profile ID from body: ${profileId}`);
      } catch (e) {
        console.log("No request body or invalid JSON");
      }
    }

    if (!profileId) {
      return errorResponse('Profile ID is required', 400);
    }

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Query the subscriptions table
    console.log(`Checking subscription for profile ID: ${profileId}`);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (error) {
      console.log(`No subscription found: ${error.message}`);
      // No subscription found, but this isn't an error
      return successResponse({ 
        hasSubscription: false,
        isPremium: false,
        isLifetime: false,
        subscriptionData: null,
        message: 'No subscription found' 
      });
    }

    // Special handling for lifetime subscriptions - they are always considered active
    if (data.is_lifetime) {
      console.log(`User ${profileId} has a lifetime subscription - marking as active`);
      
      // If the status isn't active, update it
      if (data.status !== 'active') {
        console.log(`Updating lifetime subscription status from ${data.status} to active`);
        
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('user_id', profileId);
          
        if (updateError) {
          console.error(`Error updating lifetime subscription status: ${updateError.message}`);
        } else {
          // Update the local data object to reflect the change
          data.status = 'active';
        }
      }
      
      // Lifetime subscriptions are always active and premium
      return successResponse({
        hasSubscription: true,
        isPremium: true,
        isLifetime: true,
        subscriptionData: data,
      });
    }
    
    // For non-lifetime subscriptions, check status normally
    const hasActiveSubscription = data && 
      (data.status === 'active' || data.status === 'trialing');
    
    const isLifetime = false; // We already handled lifetime above
    
    const isPremium = hasActiveSubscription;

    console.log(`Subscription status for ${profileId}: hasActive=${hasActiveSubscription}, isLifetime=${isLifetime}, isPremium=${isPremium}`);

    // Return subscription status
    return successResponse({
      hasSubscription: hasActiveSubscription,
      isPremium: isPremium,
      isLifetime: isLifetime,
      subscriptionData: data || null,
    });
  } catch (error) {
    console.error(`Error in check-subscription: ${error.message}`);
    return errorResponse(`Error checking subscription: ${error.message}`, 500);
  }
});
