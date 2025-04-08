
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Get Stripe Products Edge Function
 * 
 * Fetches all configured Stripe products and prices for the application
 * 
 * Response:
 * - Object with mapped products and their price IDs
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
    
    console.log("Fetching Stripe products");
    
    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });
    
    console.log(`Found ${products.data.length} products`);
    
    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });
    
    console.log(`Found ${prices.data.length} prices`);
    
    // Map products to their prices
    const productMap: Record<string, any> = {};
    
    for (const product of products.data) {
      // Find associated prices for this product
      const productPrices = prices.data.filter(price => price.product === product.id);
      
      if (productPrices.length === 0) {
        console.log(`No prices found for product ${product.id}`);
        continue;
      }
      
      // Select the first price for simplicity
      const price = productPrices[0];
      
      // Determine product type from metadata
      if (product.metadata.productType === 'subscription' && 
          (product.metadata.planType === 'annual' || product.name.toLowerCase().includes('annual'))) {
        productMap.annualPlus = {
          productId: product.id,
          productName: product.name,
          priceId: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          isRecurring: !!price.recurring,
          interval: price.recurring?.interval || null,
        };
      } else if (product.metadata.productType === 'one_time' && 
                (product.metadata.planType === 'lifetime' || product.name.toLowerCase().includes('lifetime'))) {
        productMap.lifetime = {
          productId: product.id,
          productName: product.name,
          priceId: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          isRecurring: false,
        };
      } else if (product.metadata.productType === 'book' && 
                (product.metadata.bookType === 'first' || product.name.toLowerCase().includes('first book'))) {
        productMap.firstBook = {
          productId: product.id,
          productName: product.name,
          priceId: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          isRecurring: false,
        };
      } else if (product.metadata.productType === 'book' && 
                (product.metadata.bookType === 'additional' || product.name.toLowerCase().includes('additional book'))) {
        productMap.additionalBook = {
          productId: product.id,
          productName: product.name,
          priceId: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          isRecurring: false,
        };
      }
    }
    
    console.log("Mapped products:", JSON.stringify(productMap));
    
    // Return the mapped products
    return new Response(
      JSON.stringify(productMap),
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
