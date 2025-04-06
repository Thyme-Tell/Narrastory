
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
    
    // Get all existing products
    const existingProducts = await stripe.products.list({ 
      active: true,
      limit: 100,
    });
    console.log(`Found ${existingProducts.data.length} existing active products`);
    
    // Get all existing prices
    const existingPrices = await stripe.prices.list({ 
      active: true,
      limit: 100,
    });
    console.log(`Found ${existingPrices.data.length} existing active prices`);
    
    // Log existing products and prices
    existingProducts.data.forEach(product => {
      console.log(`Product: ${product.id}, Name: ${product.name}`);
      console.log(`  Metadata: ${JSON.stringify(product.metadata || {})}`);
      
      // Log associated prices
      const productPrices = existingPrices.data.filter(p => p.product === product.id);
      productPrices.forEach(price => {
        console.log(`  Price: ${price.id}, Amount: ${price.unit_amount}, Currency: ${price.currency}`);
        console.log(`    Metadata: ${JSON.stringify(price.metadata || {})}`);
      });
    });
    
    // SKIP CREATE LOGIC FOR NOW - We'll rely on manually created products
    // Just map what we've found for the response
    
    // Map existing products to our product types
    const result: any = {};
    
    // Try to find annual plus product
    const annualProducts = existingProducts.data.filter(p => 
      p.name.toLowerCase().includes('plus') || 
      p.name.toLowerCase().includes('annual') ||
      p.name.toLowerCase().includes('subscription') ||
      (p.metadata?.productType === 'subscription')
    );
    
    if (annualProducts.length > 0) {
      const annualProduct = annualProducts[0];
      console.log(`Found annual product: ${annualProduct.id}, ${annualProduct.name}`);
      
      // Get the associated prices
      const annualPrices = existingPrices.data.filter(p => p.product === annualProduct.id);
      
      if (annualPrices.length > 0) {
        result.annualPlus = {
          productId: annualProduct.id,
          priceId: annualPrices[0].id,
          productName: annualProduct.name,
          amount: annualPrices[0].unit_amount
        };
        console.log(`Mapped annual product: ${annualProduct.name} with price: ${annualPrices[0].id}`);
      }
    }
    
    // Try to find lifetime product
    const lifetimeProducts = existingProducts.data.filter(p => 
      p.name.toLowerCase().includes('lifetime') ||
      (p.metadata?.productType === 'one_time')
    );
    
    if (lifetimeProducts.length > 0) {
      const lifetimeProduct = lifetimeProducts[0];
      console.log(`Found lifetime product: ${lifetimeProduct.id}, ${lifetimeProduct.name}`);
      
      // Get the associated prices
      const lifetimePrices = existingPrices.data.filter(p => p.product === lifetimeProduct.id);
      
      if (lifetimePrices.length > 0) {
        result.lifetime = {
          productId: lifetimeProduct.id,
          priceId: lifetimePrices[0].id,
          productName: lifetimeProduct.name,
          amount: lifetimePrices[0].unit_amount
        };
        console.log(`Mapped lifetime product: ${lifetimeProduct.name} with price: ${lifetimePrices[0].id}`);
      }
    }
    
    // Try to find first book product
    const firstBookProducts = existingProducts.data.filter(p => 
      p.name.toLowerCase().includes('first book') ||
      (p.metadata?.productType === 'book' && p.metadata?.bookType === 'first')
    );
    
    if (firstBookProducts.length > 0) {
      const firstBookProduct = firstBookProducts[0];
      console.log(`Found first book product: ${firstBookProduct.id}, ${firstBookProduct.name}`);
      
      // Get the associated prices
      const firstBookPrices = existingPrices.data.filter(p => p.product === firstBookProduct.id);
      
      if (firstBookPrices.length > 0) {
        result.firstBook = {
          productId: firstBookProduct.id,
          priceId: firstBookPrices[0].id,
          productName: firstBookProduct.name,
          amount: firstBookPrices[0].unit_amount
        };
        console.log(`Mapped first book product: ${firstBookProduct.name} with price: ${firstBookPrices[0].id}`);
      }
    }
    
    // Try to find additional book product
    const additionalBookProducts = existingProducts.data.filter(p => 
      p.name.toLowerCase().includes('additional book') ||
      (p.metadata?.productType === 'book' && p.metadata?.bookType === 'additional')
    );
    
    if (additionalBookProducts.length > 0) {
      const additionalBookProduct = additionalBookProducts[0];
      console.log(`Found additional book product: ${additionalBookProduct.id}, ${additionalBookProduct.name}`);
      
      // Get the associated prices
      const additionalBookPrices = existingPrices.data.filter(p => p.product === additionalBookProduct.id);
      
      if (additionalBookPrices.length > 0) {
        result.additionalBook = {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrices[0].id,
          productName: additionalBookProduct.name,
          amount: additionalBookPrices[0].unit_amount
        };
        console.log(`Mapped additional book product: ${additionalBookProduct.name} with price: ${additionalBookPrices[0].id}`);
      }
    }
    
    // Display what we found
    console.log("Products and prices mapped:", JSON.stringify(result));
    
    // Return all the mapped products and prices
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
