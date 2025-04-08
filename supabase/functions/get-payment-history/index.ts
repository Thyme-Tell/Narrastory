
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getSupabaseClient, 
  getStripeClient,
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";

/**
 * Get Payment History Edge Function
 * 
 * Retrieves the payment history for a user from Stripe.
 * 
 * Request:
 * - profileId: string (user profile ID) - via query param or request body
 * 
 * Response:
 * - payments: Array of payment objects
 */
serve(async (req) => {
  console.log("Get payment history function called");
  
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

    // Get the subscription for the user to find the Stripe customer ID
    console.log(`Getting subscription for profile ID: ${profileId}`);
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', profileId)
      .maybeSingle();

    if (subscriptionError) {
      console.error(`Error fetching subscription: ${subscriptionError.message}`);
      return errorResponse(`Error fetching subscription: ${subscriptionError.message}`, 500);
    }

    // If no subscription found, return empty payment history
    if (!subscription || !subscription.stripe_customer_id) {
      console.log(`No subscription or customer ID found for profile ID: ${profileId}`);
      return successResponse({ payments: [] });
    }

    // Initialize Stripe client
    const stripe = getStripeClient();

    // Get all charges for the customer
    console.log(`Getting charges for customer ID: ${subscription.stripe_customer_id}`);
    const charges = await stripe.charges.list({
      customer: subscription.stripe_customer_id,
      limit: 25,
    });

    // Transform the charges into a more friendly format
    const payments = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100, // Convert from cents to dollars
      currency: charge.currency,
      status: charge.status,
      date: new Date(charge.created * 1000).toISOString(),
      description: charge.description || 'Narra Story Subscription',
      receiptUrl: charge.receipt_url,
    }));

    console.log(`Found ${payments.length} payments for customer ID: ${subscription.stripe_customer_id}`);
    return successResponse({ payments });
  } catch (error) {
    console.error(`Error in get-payment-history: ${error.message}`);
    return errorResponse(`Error retrieving payment history: ${error.message}`, 500);
  }
});
