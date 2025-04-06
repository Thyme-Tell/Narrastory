
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getStripeClient, 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";

/**
 * Cancel Subscription Edge Function
 * 
 * Cancels a user's active Stripe subscription.
 * 
 * Request body:
 * - profileId: string (user profile ID)
 * 
 * Response:
 * - success: boolean (whether the cancellation was successful)
 * - message: string (status message)
 */
serve(async (req) => {
  console.log("Cancel subscription function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { profileId } = await req.json();

    if (!profileId) {
      return errorResponse('Profile ID is required', 400);
    }

    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Get the current subscription information
    const { data: subscriptionData, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, is_lifetime')
      .eq('user_id', profileId)
      .maybeSingle();

    if (fetchError) {
      console.error(`Error fetching subscription: ${fetchError.message}`);
      return errorResponse(`Error fetching subscription: ${fetchError.message}`, 500);
    }

    // Check if this is a lifetime subscription or if there's no subscription to cancel
    if (!subscriptionData) {
      return errorResponse('No subscription found for this user', 404);
    }

    if (subscriptionData.is_lifetime) {
      return errorResponse('Lifetime subscriptions cannot be canceled', 400);
    }

    const stripeSubscriptionId = subscriptionData.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      console.log('No Stripe subscription ID found, updating status only');
      
      // Update the subscription status in our database
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profileId);

      if (updateError) {
        console.error(`Error updating subscription status: ${updateError.message}`);
        return errorResponse(`Error updating subscription status: ${updateError.message}`, 500);
      }

      return successResponse({
        success: true,
        message: 'Subscription status updated to canceled'
      });
    }

    // Cancel the subscription in Stripe
    try {
      console.log(`Canceling Stripe subscription: ${stripeSubscriptionId}`);
      
      // Cancel at period end to allow usage until the end of the current billing period
      const canceledSubscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(`Stripe subscription updated: ${canceledSubscription.id}, status: ${canceledSubscription.status}`);
      
      // Update our database record
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: canceledSubscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profileId);

      if (updateError) {
        console.error(`Error updating subscription status: ${updateError.message}`);
        return errorResponse(`Error updating subscription status: ${updateError.message}`, 500);
      }

      return successResponse({
        success: true,
        message: 'Subscription canceled successfully. You will have access until the end of your current billing period.'
      });
    } catch (stripeError) {
      console.error(`Stripe error: ${stripeError.message}`);
      return errorResponse(`Error canceling subscription: ${stripeError.message}`, 500);
    }
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
});
