
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
    const products = await stripe.products.list({ active: true, limit: 100 });
    console.log(`Found ${products.data.length} active products`);
    
    // Log all product data for debugging
    products.data.forEach((product, index) => {
      console.log(`Product ${index + 1}: ID=${product.id}, Name=${product.name}`);
      console.log(`Metadata:`, JSON.stringify(product.metadata || {}));
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
    const prices = await stripe.prices.list({ active: true, limit: 100 });
    console.log(`Found ${prices.data.length} active prices`);
    
    // Log all price data for debugging
    prices.data.forEach((price, index) => {
      console.log(`Price ${index + 1}: ID=${price.id}, ProductID=${price.product}`);
      console.log(`Price amount: ${price.unit_amount}, Currency: ${price.currency}`);
      console.log(`Price metadata:`, JSON.stringify(price.metadata || {}));
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
    
    // We'll look for products by name if metadata is not set properly
    console.log("Trying to find products by both metadata and name...");
    
    // Map product types to their respective prices
    const result: any = {};
    
    // Find annual plus subscription - try multiple detection methods
    let annualPlusProduct = products.data.find(p => 
      (p.metadata?.productType === 'subscription' && p.metadata?.features?.includes('premium_voices')) ||
      p.name.toLowerCase().includes('plus') || 
      p.name.toLowerCase().includes('annual')
    );
    
    if (annualPlusProduct) {
      console.log(`Found annual plus product: ${annualPlusProduct.id}, Name: ${annualPlusProduct.name}`);
      
      // Find any price for this product
      const annualPlusPrices = prices.data.filter(p => p.product === annualPlusProduct?.id);
      
      if (annualPlusPrices.length > 0) {
        // Use the first price found
        const annualPlusPrice = annualPlusPrices[0];
        result.annualPlus = {
          productId: annualPlusProduct.id,
          priceId: annualPlusPrice.id,
          productName: annualPlusProduct.name,
          amount: annualPlusPrice.unit_amount
        };
        console.log(`Annual Plus Price ID: ${annualPlusPrice.id}, Amount: ${annualPlusPrice.unit_amount}`);
      } else {
        console.warn(`No price found for annual plus product: ${annualPlusProduct.id}`);
      }
    } else {
      console.warn("No annual plus product found in Stripe");
    }
    
    // Find lifetime product
    let lifetimeProduct = products.data.find(p => 
      (p.metadata?.productType === 'one_time' && p.metadata?.features?.includes('lifetime_access')) ||
      p.name.toLowerCase().includes('lifetime')
    );
    
    if (lifetimeProduct) {
      console.log(`Found lifetime product: ${lifetimeProduct.id}, Name: ${lifetimeProduct.name}`);
      
      // Find any price for this product
      const lifetimePrices = prices.data.filter(p => p.product === lifetimeProduct?.id);
      
      if (lifetimePrices.length > 0) {
        // Use the first price found
        const lifetimePrice = lifetimePrices[0];
        result.lifetime = {
          productId: lifetimeProduct.id,
          priceId: lifetimePrice.id,
          productName: lifetimeProduct.name,
          amount: lifetimePrice.unit_amount
        };
        console.log(`Lifetime Price ID: ${lifetimePrice.id}, Amount: ${lifetimePrice.unit_amount}`);
      } else {
        console.warn(`No price found for lifetime product: ${lifetimeProduct.id}`);
      }
    } else {
      console.warn("No lifetime product found in Stripe");
    }
    
    // Find book products
    let firstBookProduct = products.data.find(p => 
      (p.metadata?.productType === 'book' && p.metadata?.bookType === 'first') ||
      p.name.toLowerCase().includes('first book')
    );
    
    if (firstBookProduct) {
      console.log(`Found first book product: ${firstBookProduct.id}, Name: ${firstBookProduct.name}`);
      
      // Find any price for this product
      const firstBookPrices = prices.data.filter(p => p.product === firstBookProduct?.id);
      
      if (firstBookPrices.length > 0) {
        // Use the first price found
        const firstBookPrice = firstBookPrices[0];
        result.firstBook = {
          productId: firstBookProduct.id,
          priceId: firstBookPrice.id,
          productName: firstBookProduct.name,
          amount: firstBookPrice.unit_amount
        };
        console.log(`First Book Price ID: ${firstBookPrice.id}, Amount: ${firstBookPrice.unit_amount}`);
      } else {
        console.warn(`No price found for first book product: ${firstBookProduct.id}`);
      }
    } else {
      console.warn("No first book product found in Stripe");
    }
    
    let additionalBookProduct = products.data.find(p => 
      (p.metadata?.productType === 'book' && p.metadata?.bookType === 'additional') ||
      p.name.toLowerCase().includes('additional book')
    );
    
    if (additionalBookProduct) {
      console.log(`Found additional book product: ${additionalBookProduct.id}, Name: ${additionalBookProduct.name}`);
      
      // Find any price for this product
      const additionalBookPrices = prices.data.filter(p => p.product === additionalBookProduct?.id);
      
      if (additionalBookPrices.length > 0) {
        // Use the first price found
        const additionalBookPrice = additionalBookPrices[0];
        result.additionalBook = {
          productId: additionalBookProduct.id,
          priceId: additionalBookPrice.id,
          productName: additionalBookProduct.name,
          amount: additionalBookPrice.unit_amount
        };
        console.log(`Additional Book Price ID: ${additionalBookPrice.id}, Amount: ${additionalBookPrice.unit_amount}`);
      } else {
        console.warn(`No price found for additional book product: ${additionalBookProduct.id}`);
      }
    } else {
      console.warn("No additional book product found in Stripe");
    }
    
    // If no products found, try a more generic approach
    if (Object.keys(result).length === 0) {
      console.log("No products matched by type, trying generic approach...");
      
      // Find products with prices and sort them into categories
      for (const product of products.data) {
        const productPrices = prices.data.filter(p => p.product === product.id);
        
        if (productPrices.length > 0) {
          const price = productPrices[0];
          const productName = product.name.toLowerCase();
          
          // Attempt to categorize based on product name
          if (productName.includes('lifetime')) {
            result.lifetime = {
              productId: product.id,
              priceId: price.id,
              productName: product.name,
              amount: price.unit_amount
            };
            console.log(`Assigned ${product.name} as 'lifetime' product`);
          } else if (productName.includes('annual') || productName.includes('plus') || productName.includes('subscription')) {
            result.annualPlus = {
              productId: product.id,
              priceId: price.id,
              productName: product.name,
              amount: price.unit_amount
            };
            console.log(`Assigned ${product.name} as 'annualPlus' product`);
          } else if (productName.includes('first book')) {
            result.firstBook = {
              productId: product.id,
              priceId: price.id,
              productName: product.name,
              amount: price.unit_amount
            };
            console.log(`Assigned ${product.name} as 'firstBook' product`);
          } else if (productName.includes('additional book')) {
            result.additionalBook = {
              productId: product.id,
              priceId: price.id,
              productName: product.name,
              amount: price.unit_amount
            };
            console.log(`Assigned ${product.name} as 'additionalBook' product`);
          }
        }
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
