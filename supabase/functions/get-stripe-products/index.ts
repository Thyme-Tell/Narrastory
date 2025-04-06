
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
    
    // Log all product data for debugging
    products.data.forEach((product, index) => {
      console.log(`Product ${index + 1}: ID=${product.id}, Name=${product.name}, Type=${product.metadata?.productType}`);
      console.log(`Features: ${product.metadata?.features}`);
    });
    
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
    
    // Log all price data for debugging
    prices.data.forEach((price, index) => {
      console.log(`Price ${index + 1}: ID=${price.id}, ProductID=${price.product}, Type=${price.metadata?.planType}`);
      console.log(`Amount: ${price.unit_amount}, Currency: ${price.currency}`);
    });
    
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
      console.log(`Found annual plus product: ${annualPlusProduct.id}`);
      const annualPlusPrice = prices.data.find(p => 
        p.product === annualPlusProduct.id && p.metadata?.planType === 'plus'
      );
      
      if (annualPlusPrice) {
        result.annualPlus = {
          productId: annualPlusProduct.id,
          priceId: annualPlusPrice.id
        };
        console.log(`Annual Plus Price ID: ${annualPlusPrice.id}`);
      } else {
        console.warn(`No price found for annual plus product: ${annualPlusProduct.id}`);
      }
    } else {
      console.warn("No annual plus product found in Stripe");
    }
    
    // Find lifetime product
    const lifetimeProduct = products.data.find(p => 
      p.metadata?.productType === 'one_time' && p.metadata?.features?.includes('lifetime_access')
    );
    
    if (lifetimeProduct) {
      console.log(`Found lifetime product: ${lifetimeProduct.id}`);
      const lifetimePrice = prices.data.find(p => 
        p.product === lifetimeProduct.id && p.metadata?.planType === 'lifetime'
      );
      
      if (lifetimePrice) {
        result.lifetime = {
          productId: lifetimeProduct.id,
          priceId: lifetimePrice.id
        };
        console.log(`Lifetime Price ID: ${lifetimePrice.id}`);
      } else {
        console.warn(`No price found for lifetime product: ${lifetimeProduct.id}`);
      }
    } else {
      console.warn("No lifetime product found in Stripe");
    }
    
    // Find book products
    const firstBookProduct = products.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'first'
    );
    
    if (firstBookProduct) {
      console.log(`Found first book product: ${firstBookProduct.id}`);
      const firstBookPrice = prices.data.find(p => 
        p.product === firstBookProduct.id && p.metadata?.bookType === 'first'
      );
      
      if (firstBookPrice) {
        result.firstBook = {
          productId: firstBookProduct.id,
          priceId: firstBookPrice.id
        };
        console.log(`First Book Price ID: ${firstBookPrice.id}`);
      } else {
        console.warn(`No price found for first book product: ${firstBookProduct.id}`);
      }
    } else {
      console.warn("No first book product found in Stripe");
    }
    
    const additionalBookProduct = products.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'additional'
    );
    
    if (additionalBookProduct) {
      console.log(`Found additional book product: ${additionalBookProduct.id}`);
      const additionalBookPrice = prices.data.find(p => 
        p.product === additionalBookProduct.id && p.metadata?.bookType === 'additional'
      );
      
      if (additionalBookPrice) {
        result.additionalBook = {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrice.id
        };
        console.log(`Additional Book Price ID: ${additionalBookPrice.id}`);
      } else {
        console.warn(`No price found for additional book product: ${additionalBookProduct.id}`);
      }
    } else {
      console.warn("No additional book product found in Stripe");
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
