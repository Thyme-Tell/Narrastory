
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Success and cancel URLs are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not properly configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client if profileId is provided
    let userEmail = email;
    if (profileId && !userEmail) {
      console.log(`Looking up email for profile ID: ${profileId}`);
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase credentials not configured');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', profileId)
          .single();

        if (error || !data?.email) {
          console.error(`Error fetching email: ${error?.message}`);
          return new Response(
            JSON.stringify({ error: `Could not find email for profile ID: ${profileId}` }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        userEmail = data.email;
        console.log(`Found email: ${userEmail}`);
      } catch (err) {
        console.error(`Error in profile lookup: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Error retrieving user profile: ${err.message}` }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Fetch the price to determine if it's a subscription or one-time payment
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (err) {
      console.error(`Error retrieving price: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Invalid price ID: ${err.message}` }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Determine if this is a subscription or one-time payment
    const mode = price.recurring ? 'subscription' : 'payment';
    console.log(`Creating ${mode} checkout`);

    // Prepare checkout session parameters
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
    
    // Add promo code if provided
    if (promoCode) {
      try {
        console.log(`Validating promo code: ${promoCode}`);
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1
        });
        
        if (promotionCodes.data.length > 0) {
          console.log(`Valid promo code found: ${promoCode}`);
          sessionParams.discounts = [{ promotion_code: promotionCodes.data[0].id }];
        } else {
          console.log(`No valid promo code found for: ${promoCode}`);
          return new Response(
            JSON.stringify({ error: `Invalid or expired promotion code: ${promoCode}` }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      } catch (promoErr) {
        console.error(`Error validating promo code: ${promoErr.message}`);
        return new Response(
          JSON.stringify({ error: `Error validating promotion code: ${promoErr.message}` }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Create checkout session
    try {
      console.log(`Creating Stripe checkout session with mode: ${mode}`);
      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log(`Checkout session created: ${session.id}`);
      
      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (stripeErr) {
      console.error(`Stripe error: ${stripeErr.message}`);
      return new Response(
        JSON.stringify({ error: `Error creating checkout session: ${stripeErr.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
