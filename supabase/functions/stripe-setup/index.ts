
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Stripe Setup Edge Function
 * 
 * Creates necessary Stripe products and prices for the application:
 * - Annual Plus subscription ($249/year)
 * - Lifetime Access ($399 one-time)
 * - First Book Publishing ($79)
 * - Additional Book Publishing ($29)
 * 
 * This function ensures the Stripe account has all required products and prices
 * for the Narra application to function correctly.
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
    
    // Create or update the annual plus subscription product and price
    let annualPlusProduct;
    const existingProducts = await stripe.products.list({ active: true });
    
    // Find annual plus product or create it
    annualPlusProduct = existingProducts.data.find(p => 
      p.metadata?.productType === 'subscription' && p.metadata?.features?.includes('premium_voices')
    );
    
    if (!annualPlusProduct) {
      console.log("Creating annual plus subscription product");
      annualPlusProduct = await stripe.products.create({
        name: 'Narra Plus Annual Subscription',
        description: 'Access to premium voices and 2 book credits per year',
        metadata: {
          productType: 'subscription',
          features: 'premium_voices,book_credits'
        }
      });
    } else {
      console.log(`Found existing annual plus product: ${annualPlusProduct.id}`);
    }
    
    // Create or retrieve annual plus price
    let annualPlusPrice;
    const existingPrices = await stripe.prices.list({ active: true, product: annualPlusProduct.id });
    
    annualPlusPrice = existingPrices.data.find(p => p.metadata?.planType === 'plus');
    
    if (!annualPlusPrice) {
      console.log("Creating annual plus subscription price");
      annualPlusPrice = await stripe.prices.create({
        product: annualPlusProduct.id,
        unit_amount: 24900, // $249.00
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          planType: 'plus'
        }
      });
    } else {
      console.log(`Found existing annual plus price: ${annualPlusPrice.id}`);
    }
    
    // Create or update the lifetime access product and price
    let lifetimeProduct;
    
    // Find lifetime product or create it
    lifetimeProduct = existingProducts.data.find(p => 
      p.metadata?.productType === 'one_time' && p.metadata?.features?.includes('lifetime_access')
    );
    
    if (!lifetimeProduct) {
      console.log("Creating lifetime access product");
      lifetimeProduct = await stripe.products.create({
        name: 'Narra Lifetime Access',
        description: 'Lifetime access to premium features',
        metadata: {
          productType: 'one_time',
          features: 'lifetime_access,premium_voices,unlimited_books'
        }
      });
    } else {
      console.log(`Found existing lifetime product: ${lifetimeProduct.id}`);
    }
    
    // Create or retrieve lifetime price
    let lifetimePrice;
    const lifetimePrices = await stripe.prices.list({ active: true, product: lifetimeProduct.id });
    
    lifetimePrice = lifetimePrices.data.find(p => p.metadata?.planType === 'lifetime');
    
    if (!lifetimePrice) {
      console.log("Creating lifetime access price");
      lifetimePrice = await stripe.prices.create({
        product: lifetimeProduct.id,
        unit_amount: 39900, // $399.00
        currency: 'usd',
        metadata: {
          planType: 'lifetime'
        }
      });
    } else {
      console.log(`Found existing lifetime price: ${lifetimePrice.id}`);
    }
    
    // Create or update the book products
    let firstBookProduct;
    
    // Find first book product or create it
    firstBookProduct = existingProducts.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'first'
    );
    
    if (!firstBookProduct) {
      console.log("Creating first book product");
      firstBookProduct = await stripe.products.create({
        name: 'First Book Publishing',
        description: 'Publish your first printed book',
        metadata: {
          productType: 'book',
          bookType: 'first'
        }
      });
    } else {
      console.log(`Found existing first book product: ${firstBookProduct.id}`);
    }
    
    // Create or retrieve first book price
    let firstBookPrice;
    const firstBookPrices = await stripe.prices.list({ active: true, product: firstBookProduct.id });
    
    firstBookPrice = firstBookPrices.data.find(p => p.metadata?.bookType === 'first');
    
    if (!firstBookPrice) {
      console.log("Creating first book price");
      firstBookPrice = await stripe.prices.create({
        product: firstBookProduct.id,
        unit_amount: 7900, // $79.00
        currency: 'usd',
        metadata: {
          bookType: 'first'
        }
      });
    } else {
      console.log(`Found existing first book price: ${firstBookPrice.id}`);
    }
    
    let additionalBookProduct;
    
    // Find additional book product or create it
    additionalBookProduct = existingProducts.data.find(p => 
      p.metadata?.productType === 'book' && p.metadata?.bookType === 'additional'
    );
    
    if (!additionalBookProduct) {
      console.log("Creating additional book product");
      additionalBookProduct = await stripe.products.create({
        name: 'Additional Book Publishing',
        description: 'Publish additional printed books',
        metadata: {
          productType: 'book',
          bookType: 'additional'
        }
      });
    } else {
      console.log(`Found existing additional book product: ${additionalBookProduct.id}`);
    }
    
    // Create or retrieve additional book price
    let additionalBookPrice;
    const additionalBookPrices = await stripe.prices.list({ active: true, product: additionalBookProduct.id });
    
    additionalBookPrice = additionalBookPrices.data.find(p => p.metadata?.bookType === 'additional');
    
    if (!additionalBookPrice) {
      console.log("Creating additional book price");
      additionalBookPrice = await stripe.prices.create({
        product: additionalBookProduct.id,
        unit_amount: 2900, // $29.00
        currency: 'usd',
        metadata: {
          bookType: 'additional'
        }
      });
    } else {
      console.log(`Found existing additional book price: ${additionalBookPrice.id}`);
    }
    
    // Return all the created products and prices
    return new Response(
      JSON.stringify({
        annualPlus: {
          productId: annualPlusProduct.id,
          priceId: annualPlusPrice.id
        },
        lifetime: {
          productId: lifetimeProduct.id,
          priceId: lifetimePrice.id
        },
        firstBook: {
          productId: firstBookProduct.id,
          priceId: firstBookPrice.id
        },
        additionalBook: {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrice.id
        }
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
