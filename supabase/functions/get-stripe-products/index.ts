
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Get Stripe Products Edge Function
 * 
 * Retrieves the Stripe products and prices created by the setup function.
 * This helps frontend code map from product identifiers to actual Stripe price IDs.
 * 
 * Response:
 * - Product and price IDs for all available products
 */
serve(async (req) => {
  console.log("Get Stripe products function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error("Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: "Stripe not properly configured" }),
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

    console.log("Fetching Stripe products and prices");
    
    // Get all active products
    const products = await stripe.products.list({ active: true });
    console.log(`Found ${products.data.length} active products`);
    
    if (products.data.length === 0) {
      console.warn("No active products found in Stripe");
      // Return empty but valid result object
      return new Response(
        JSON.stringify({}),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Get all active prices
    const prices = await stripe.prices.list({ active: true });
    console.log(`Found ${prices.data.length} active prices`);
    
    if (prices.data.length === 0) {
      console.warn("No active prices found in Stripe");
      // Return empty but valid result object
      return new Response(
        JSON.stringify({}),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Map product types to their respective prices
    const result: any = {};
    
    // Find annual plus subscription
    const annualPlusProduct = products.data.find(p => 
      p.metadata?.productType === 'subscription' && p.metadata?.features?.includes('premium_voices')
    );
    
    if (annualPlusProduct) {
      const annualPlusPrice = prices.data.find(p => 
        p.product === annualPlusProduct.id && p.metadata?.planType === 'plus'
      );
      
      if (annualPlusPrice) {
        result.annualPlus = {
          productId: annualPlusProduct.id,
          priceId: annualPlusPrice.id
        };
        console.log(`Annual Plus Price ID: ${annualPlusPrice.id}`);
      }
    }
    
    // Find lifetime product
    const lifetimeProduct = products.data.find(p => 
      p.metadata?.productType === 'one_time' && p.metadata?.features?.includes('lifetime_access')
    );
    
    if (lifetimeProduct) {
      const lifetimePrice = prices.data.find(p => 
        p.product === lifetimeProduct.id && p.metadata?.planType === 'lifetime'
      );
      
      if (lifetimePrice) {
        result.lifetime = {
          productId: lifetimeProduct.id,
          priceId: lifetimePrice.id
        };
        console.log(`Lifetime Price ID: ${lifetimePrice.id}`);
      }
    }
    
    // Find book products
    const firstBookProduct = products.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'first'
    );
    
    if (firstBookProduct) {
      const firstBookPrice = prices.data.find(p => 
        p.product === firstBookProduct.id && p.metadata?.bookType === 'first'
      );
      
      if (firstBookPrice) {
        result.firstBook = {
          productId: firstBookProduct.id,
          priceId: firstBookPrice.id
        };
        console.log(`First Book Price ID: ${firstBookPrice.id}`);
      }
    }
    
    const additionalBookProduct = products.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'additional'
    );
    
    if (additionalBookProduct) {
      const additionalBookPrice = prices.data.find(p => 
        p.product === additionalBookProduct.id && p.metadata?.bookType === 'additional'
      );
      
      if (additionalBookPrice) {
        result.additionalBook = {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrice.id
        };
        console.log(`Additional Book Price ID: ${additionalBookPrice.id}`);
      }
    }
    
    // Log the complete result for debugging
    console.log("Products and prices retrieved:", JSON.stringify(result));
    
    // Return the mapped products and prices
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error(`Error fetching Stripe products: ${error.message}`);
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
