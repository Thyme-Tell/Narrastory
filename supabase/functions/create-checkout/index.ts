
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getStripeClient, 
  getSupabaseClient, 
  errorResponse, 
  successResponse,
  PRICE_IDS 
} from "../_shared/stripe-utils.ts";

/**
 * Create Checkout Edge Function
 * 
 * Creates a Stripe checkout session for various product types:
 * - Annual Plus subscription ($249/year)
 * - Lifetime Access ($399 one-time)
 * - First Book Publishing ($79)
 * - Additional Book Publishing ($29)
 * 
 * Request body:
 * - priceId: string (Stripe price ID)
 * - profileId: string (optional, user profile ID)
 * - email: string (optional, user email)
 * - successUrl: string (redirect URL on success)
 * - cancelUrl: string (redirect URL on cancel)
 * - mode: string (optional, 'payment' or 'subscription')
 * - couponCode: string (optional, discount coupon code)
 * 
 * Response:
 * - sessionId: string (Stripe session ID)
 * - url: string (Checkout URL)
 */
serve(async (req) => {
  console.log("Create checkout function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const reqBody = await req.json();
    const { 
      priceId, 
      successUrl, 
      cancelUrl, 
      email, 
      profileId, 
      mode: requestedMode,
      couponCode 
    } = reqBody;

    console.log(`Request received with priceId: ${priceId}`);
    console.log(`Profile ID: ${profileId}, Email: ${email}, Mode: ${requestedMode || 'not specified'}`);
    if (couponCode) {
      console.log(`Coupon code provided: ${couponCode}`);
    }

    // Validate required fields
    if (!priceId) {
      return errorResponse('Price ID is required', 400);
    }

    if (!successUrl || !cancelUrl) {
      return errorResponse('Success and cancel URLs are required', 400);
    }

    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // If profileId is provided, get user email
    let userEmail = email;
    if (profileId && !userEmail) {
      console.log(`Looking up email for profile ID: ${profileId}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', profileId)
          .single();

        if (error || !data?.email) {
          console.error(`Error fetching email: ${error?.message}`);
          return errorResponse(`Could not find email for profile ID: ${profileId}`, 404);
        }

        userEmail = data.email;
        console.log(`Found email: ${userEmail}`);
      } catch (err) {
        console.error(`Error in profile lookup: ${err.message}`);
        return errorResponse(`Error retrieving user profile: ${err.message}`, 500);
      }
    }

    // Determine if this is a subscription or one-time payment
    let mode: 'payment' | 'subscription' = 'payment';
    
    if (requestedMode === 'subscription') {
      mode = 'subscription';
      console.log("Mode explicitly set to subscription");
    } else if (requestedMode === 'payment') {
      mode = 'payment';
      console.log("Mode explicitly set to payment");
    } else if (priceId === PRICE_IDS.ANNUAL_PLUS) {
      mode = 'subscription';
      console.log("Creating subscription checkout based on product ID");
    } else {
      console.log("Creating one-time payment checkout");
    }

    // Create checkout session
    try {
      console.log(`Creating Stripe checkout session with mode: ${mode}`);
      
      // Prepare session parameters
      const sessionParams: any = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
          profileId: profileId || '',
        },
      };
      
      // Add discount coupon if provided
      if (couponCode && couponCode.trim()) {
        console.log(`Applying coupon code: ${couponCode}`);
        sessionParams.discounts = [
          {
            coupon: couponCode.trim(),
          },
        ];
      }
      
      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log(`Checkout session created: ${session.id}`);
      
      // Return the session ID and URL
      return successResponse({
        sessionId: session.id,
        url: session.url,
      });
    } catch (stripeErr) {
      console.error(`Stripe error: ${stripeErr.message}`);
      
      // Check if the error is related to an invalid coupon code
      if (stripeErr.message && stripeErr.message.includes('coupon')) {
        return errorResponse(`Invalid coupon code: ${stripeErr.message}`, 400);
      }
      
      return errorResponse(`Error creating checkout session: ${stripeErr.message}`, 500);
    }
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
});
