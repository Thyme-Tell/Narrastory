
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Price IDs for different products
const PRICE_IDS = {
  ANNUAL_PLUS: Deno.env.get('STRIPE_ANNUAL_PLUS_PRICE_ID') || 'price_placeholder',
  LIFETIME: Deno.env.get('STRIPE_LIFETIME_PRICE_ID') || 'price_placeholder',
  FIRST_BOOK: Deno.env.get('STRIPE_FIRST_BOOK_PRICE_ID') || 'price_placeholder',
  ADDITIONAL_BOOK: Deno.env.get('STRIPE_ADDITIONAL_BOOK_PRICE_ID') || 'price_placeholder',
};

interface CheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
  profileId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { priceId, successUrl, cancelUrl, email, profileId }: CheckoutRequest = await req.json();

    if (!priceId) {
      throw new Error('Price ID is required');
    }

    if (!successUrl || !cancelUrl) {
      throw new Error('Success and cancel URLs are required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // If profileId is provided, get user email
    let userEmail = email;
    if (profileId && !userEmail) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', profileId)
        .single();

      if (error || !data?.email) {
        throw new Error(`Could not find email for profile ID: ${profileId}`);
      }

      userEmail = data.email;
    }

    // Determine if this is a subscription or one-time payment
    let mode: 'payment' | 'subscription' = 'payment';
    if (priceId === PRICE_IDS.ANNUAL_PLUS) {
      mode = 'subscription';
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
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
    });

    // Return the session ID and URL
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
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
