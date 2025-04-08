
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Stripe Setup Edge Function
 * 
 * Creates Stripe products and prices for Narra application:
 * - Annual Plus subscription
 * - Lifetime Access
 * - First Book Publishing
 * - Additional Book Publishing
 */
serve(async (req) => {
  console.log("Stripe setup function called");
  
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

    console.log("Creating Stripe products and prices");
    
    // Define product and price configurations
    const productConfigurations = [
      {
        name: "Narra+ Annual Subscription",
        description: "Annual subscription with premium features",
        metadata: { 
          productType: 'subscription', 
          planType: 'annual' 
        },
        prices: [
          {
            unitAmount: 24900, // $249.00
            interval: 'year',
            currency: 'usd'
          }
        ]
      },
      {
        name: "Narra Lifetime Access",
        description: "One-time purchase for lifetime premium access",
        metadata: { 
          productType: 'one_time', 
          planType: 'lifetime' 
        },
        prices: [
          {
            unitAmount: 39900, // $399.00
            currency: 'usd'
          }
        ]
      },
      {
        name: "First Book Publishing",
        description: "Publishing service for your first book",
        metadata: { 
          productType: 'book', 
          bookType: 'first' 
        },
        prices: [
          {
            unitAmount: 7900, // $79.00
            currency: 'usd'
          }
        ]
      },
      {
        name: "Additional Book Publishing",
        description: "Publishing service for additional books",
        metadata: { 
          productType: 'book', 
          bookType: 'additional' 
        },
        prices: [
          {
            unitAmount: 2900, // $29.00
            currency: 'usd'
          }
        ]
      }
    ];

    const createdProducts = [];

    // Create products and prices
    for (const config of productConfigurations) {
      console.log(`Creating product: ${config.name}`);
      
      const product = await stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: config.metadata
      });
      
      console.log(`Created product with ID: ${product.id}`);

      for (const priceConfig of config.prices) {
        const priceData: any = {
          product: product.id,
          unit_amount: priceConfig.unitAmount,
          currency: priceConfig.currency
        };

        // Add recurring interval for subscription
        if (priceConfig.interval) {
          priceData.recurring = { interval: priceConfig.interval };
        }

        const price = await stripe.prices.create(priceData);
        console.log(`Created price with ID: ${price.id} for product ${product.id}`);

        createdProducts.push({
          productId: product.id,
          priceId: price.id,
          name: config.name,
          amount: priceConfig.unitAmount,
          interval: priceConfig.interval
        });
      }
    }

    console.log("Products and prices created successfully");
    
    return new Response(
      JSON.stringify(createdProducts),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error(`Error setting up Stripe: ${error.message}`);
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
