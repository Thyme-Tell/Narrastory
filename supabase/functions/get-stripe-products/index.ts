
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
    
    // Fetch all active products - include the specific IDs provided
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      ids: ['prod_S52DtoQFIZmzDL','prod_S52DRcMxeWMRQ6']
    });
    
    console.log(`Found ${products.data.length} products`);
    console.log(`Products data: ${JSON.stringify(products.data.map(p => ({ id: p.id, name: p.name })))}`);
    
    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });
    
    console.log(`Found ${prices.data.length} prices`);
    
    // Map products to their prices
    const productMap: Record<string, any> = {};
    
    // If no products found, let's create default products for testing
    if (products.data.length === 0 || prices.data.length === 0) {
      console.log("No products or prices found, returning hardcoded values for development");
      
      // Return hardcoded values for development/testing
      return new Response(
        JSON.stringify({
          annualPlus: {
            productId: "prod_S52DtoQFIZmzDL", // Annual plan
            productName: "Narra+ Annual Subscription",
            priceId: "price_dev_annual", // This is a dummy ID for development
            amount: 249,
            currency: "usd",
            isRecurring: true,
            interval: "year",
          },
          lifetime: {
            productId: "prod_S52DRcMxeWMRQ6", // Lifetime plan
            productName: "Narra Lifetime Access",
            priceId: "price_dev_lifetime", // This is a dummy ID for development
            amount: 399,
            currency: "usd",
            isRecurring: false,
          },
          firstBook: {
            productId: "prod_dev_firstbook",
            productName: "First Book Publishing",
            priceId: "price_dev_firstbook", // This is a dummy ID for development
            amount: 79,
            currency: "usd",
            isRecurring: false,
          },
          additionalBook: {
            productId: "prod_dev_addbook",
            productName: "Additional Book Publishing",
            priceId: "price_dev_addbook", // This is a dummy ID for development
            amount: 29,
            currency: "usd",
            isRecurring: false,
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
    }
    
    // Process all the products we have
    for (const product of products.data) {
      // Find associated prices for this product
      const productPrices = prices.data.filter(price => price.product === product.id);
      
      if (productPrices.length === 0) {
        console.log(`No prices found for product ${product.id}`);
        continue;
      }
      
      // Select the first price for simplicity
      const price = productPrices[0];
      
      console.log(`Processing product: ${product.name} with ID ${product.id}`);
      console.log(`Product metadata:`, product.metadata);
      
      // Specific handling for the known product IDs - corrected mapping
      if (product.id === 'prod_S52DtoQFIZmzDL' || 
          (product.metadata.productType === 'subscription' && 
          (product.metadata.planType === 'annual' || product.name.toLowerCase().includes('annual')))) {
        productMap.annualPlus = {
          productId: product.id,
          productName: product.name,
          priceId: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          isRecurring: !!price.recurring,
          interval: price.recurring?.interval || null,
        };
      } else if (product.id === 'prod_S52DRcMxeWMRQ6' || 
                (product.metadata.productType === 'one_time' && 
                (product.metadata.planType === 'lifetime' || product.name.toLowerCase().includes('lifetime')))) {
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
      } else {
        // If we can't determine the product type from metadata, try to guess from the name
        const productName = product.name.toLowerCase();
        
        if (productName.includes('annual') || productName.includes('yearly') || productName.includes('subscription')) {
          productMap.annualPlus = {
            productId: product.id,
            productName: product.name,
            priceId: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            isRecurring: !!price.recurring,
            interval: price.recurring?.interval || null,
          };
        } else if (productName.includes('lifetime') || productName.includes('forever')) {
          productMap.lifetime = {
            productId: product.id,
            productName: product.name,
            priceId: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            isRecurring: false,
          };
        }
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
