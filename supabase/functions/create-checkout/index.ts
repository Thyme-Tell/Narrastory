
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Create Checkout Edge Function
 * 
 * Creates a Stripe checkout session for various product types:
 * - Annual Plus subscription (Yearly)
 * - Lifetime Access
 * 
 * Request body:
 * - priceId: string (Stripe product ID)
 * - profileId: string (optional, user profile ID)
 * - email: string (optional, user email)
 * - successUrl: string (redirect URL on success)
 * - cancelUrl: string (redirect URL on cancel)
 * - promoCode: string (optional, promotional code for discounts)
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
    const { priceId, successUrl, cancelUrl, email, profileId, promoCode } = reqBody;

    console.log(`Request received with priceId: ${priceId}`);
    console.log(`Profile ID: ${profileId}, Email: ${email}`);
    if (promoCode) {
      console.log(`Promo code provided: ${promoCode}`);
    }

    // Validate required fields
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Success and cancel URLs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe client
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || "", {
      apiVersion: '2023-10-16',
    });

    // Look up product details based on the provided product ID
    const lookupPrices = async (productId: string) => {
      try {
        // First, find the product
        const product = await stripe.products.retrieve(productId);
        
        // If product exists, get its associated prices
        if (product) {
          const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1,
          });
          
          if (prices.data.length > 0) {
            return prices.data[0].id;
          }
        }
        return null;
      } catch (error) {
        console.error(`Error looking up prices for product ${productId}:`, error);
        return null;
      }
    };

    // Find the actual price ID based on the product ID
    const actualPriceId = await lookupPrices(priceId);
    
    if (!actualPriceId) {
      return new Response(
        JSON.stringify({ error: `No active price found for product: ${priceId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found price ID: ${actualPriceId} for product: ${priceId}`);

    // Prepare checkout session parameters
    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: priceId === 'prod_S52DtoQFIZmzDL' ? 'subscription' : 'payment', // Yearly is subscription, Lifetime is one-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        profileId: profileId || '',
      },
    };
    
    // Add promo code if provided
    if (promoCode) {
      try {
        // Check if the promo code exists
        console.log(`Validating promo code: ${promoCode}`);
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1
        });
        
        if (promotionCodes.data.length > 0) {
          console.log(`Valid promo code found: ${promoCode}`);
          // Use the promotion code ID from the retrieved code
          sessionParams.discounts = [{ promotion_code: promotionCodes.data[0].id }];
        } else {
          console.log(`No valid promo code found for: ${promoCode}`);
          return new Response(
            JSON.stringify({ error: `Invalid or expired promotion code: ${promoCode}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (promoErr) {
        console.error(`Error validating promo code: ${promoErr.message}`);
        return new Response(
          JSON.stringify({ error: `Error validating promotion code: ${promoErr.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create checkout session
    try {
      console.log(`Creating Stripe checkout session with mode: ${sessionParams.mode}`);
      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log(`Checkout session created: ${session.id}`);
      
      // Return the session ID and URL
      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeErr) {
      console.error(`Stripe error: ${stripeErr.message}`);
      return new Response(
        JSON.stringify({ error: `Error creating checkout session: ${stripeErr.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
