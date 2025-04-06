import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Stripe setup initiated');

    // Create Annual Plus subscription product
    const annualPlusProduct = await stripe.products.create({
      name: 'Narra Plus Annual Subscription',
      description: 'Annual subscription to Narra Plus with premium features',
      metadata: {
        productType: 'subscription',
        features: 'unlimited_stories,premium_voices,priority_support'
      },
    });

    // Annual Plus price - $249/year
    const annualPlusPrice = await stripe.prices.create({
      product: annualPlusProduct.id,
      unit_amount: 24900, // $249.00
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        planType: 'plus',
      },
    });

    // Create Lifetime product
    const lifetimeProduct = await stripe.products.create({
      name: 'Narra Lifetime Access',
      description: 'One-time payment for lifetime access to Narra Plus',
      metadata: {
        productType: 'one_time',
        features: 'unlimited_stories,premium_voices,priority_support,lifetime_access'
      },
    });

    // Lifetime price - $399 one-time
    const lifetimePrice = await stripe.prices.create({
      product: lifetimeProduct.id,
      unit_amount: 39900, // $399.00
      currency: 'usd',
      metadata: {
        planType: 'lifetime',
      },
    });

    // Set up First Book product
    const firstBookProduct = await stripe.products.create({
      name: 'First Book Publishing',
      description: 'Publish your first Narra book',
      metadata: {
        productType: 'book',
        bookType: 'first'
      },
    });

    // First Book price - Updated to $79
    const firstBookPrice = await stripe.prices.create({
      product: firstBookProduct.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      metadata: {
        bookType: 'first',
      },
    });

    // Set up Additional Book product
    const additionalBookProduct = await stripe.products.create({
      name: 'Additional Book Publishing',
      description: 'Publish additional Narra books',
      metadata: {
        productType: 'book',
        bookType: 'additional'
      },
    });

    // Additional Book price - Updated to $29
    const additionalBookPrice = await stripe.prices.create({
      product: additionalBookProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      metadata: {
        bookType: 'additional',
      },
    });

    // Configure webhook endpoints
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/stripe-webhook`,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.paid',
        'invoice.payment_failed'
      ],
    });

    // Return all the created products and prices
    return new Response(
      JSON.stringify({
        annualPlus: {
          productId: annualPlusProduct.id,
          priceId: annualPlusPrice.id,
        },
        lifetime: {
          productId: lifetimeProduct.id,
          priceId: lifetimePrice.id,
        },
        firstBook: {
          productId: firstBookProduct.id,
          priceId: firstBookPrice.id,
        },
        additionalBook: {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrice.id,
        },
        webhookSecret: webhookEndpoint.secret,
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
    console.error('Error creating Stripe products:', error);
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
