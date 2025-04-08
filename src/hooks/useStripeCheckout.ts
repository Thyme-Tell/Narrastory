
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the checkout options type
export interface CheckoutOptions {
  priceId: string;
  profileId?: string;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
  promoCode?: string;
}

// Define product IDs - these should match the actual Stripe product IDs
export const STRIPE_PRODUCTS = {
  // Corrected product IDs based on Stripe's actual configuration from the API response
  ANNUAL_PLUS: 'prod_S52DtoQFIZmzDL',  // "Narra+ Yearly" - $249/year
  LIFETIME: 'prod_S52DRcMxeWMRQ6',     // "Narra Lifetime" - $399 one-time
  FIRST_BOOK: 'FIRST_BOOK',
  ADDITIONAL_BOOK: 'ADDITIONAL_BOOK',
};

/**
 * Hook to create and redirect to Stripe checkout sessions
 */
export const useStripeCheckout = () => {
  const { toast } = useToast();

  // Mutation to create a checkout session
  const createCheckout = useMutation({
    mutationFn: async (options: CheckoutOptions) => {
      // Set default success and cancel URLs if not provided
      const origin = window.location.origin;
      const successUrl = options.successUrl || `${origin}/payment-success`;
      const cancelUrl = options.cancelUrl || `${origin}/payment-canceled`;

      try {
        console.log(`Creating checkout with priceId: ${options.priceId}`);
        
        // Get actual Stripe price IDs
        const { data: setupData, error: setupError } = await supabase.functions.invoke('get-stripe-products', {});
        
        if (setupError) {
          console.error('Error fetching Stripe products:', setupError);
          throw setupError;
        }
        
        if (!setupData) {
          throw new Error('No product data returned from setup function');
        }
        
        console.log('Stripe products data:', setupData);
        
        // Map the product key to the actual Stripe price ID
        let actualPriceId = options.priceId;
        let foundProduct = false;
        
        // Handle the direct product ID case (when we're passing actual product IDs)
        if (options.priceId === STRIPE_PRODUCTS.ANNUAL_PLUS && setupData.lifetime?.priceId) {
          actualPriceId = setupData.lifetime.priceId;
          foundProduct = true;
          console.log(`Found annual plus product, using price ID: ${actualPriceId}`);
        } else if (options.priceId === STRIPE_PRODUCTS.LIFETIME && setupData.annualPlus?.priceId) {
          actualPriceId = setupData.annualPlus.priceId;
          foundProduct = true;
          console.log(`Found lifetime product, using price ID: ${actualPriceId}`);
        } else if (options.priceId === STRIPE_PRODUCTS.FIRST_BOOK && setupData.firstBook?.priceId) {
          actualPriceId = setupData.firstBook.priceId;
          foundProduct = true;
          console.log(`Found first book product, using price ID: ${actualPriceId}`);
        } else if (options.priceId === STRIPE_PRODUCTS.ADDITIONAL_BOOK && setupData.additionalBook?.priceId) {
          actualPriceId = setupData.additionalBook.priceId;
          foundProduct = true;
          console.log(`Found additional book product, using price ID: ${actualPriceId}`);
        }
        
        // Fallback to legacy ID handling
        if (!foundProduct && options.priceId === 'ANNUAL_PLUS' && setupData.lifetime?.priceId) {
          actualPriceId = setupData.lifetime.priceId;
          foundProduct = true;
          console.log(`Found annual plus product (legacy ID), using price ID: ${actualPriceId}`);
        } else if (!foundProduct && options.priceId === 'LIFETIME' && setupData.annualPlus?.priceId) {
          actualPriceId = setupData.annualPlus.priceId;
          foundProduct = true;
          console.log(`Found lifetime product (legacy ID), using price ID: ${actualPriceId}`);
        }
        
        // If we're in development mode and using price_dev ids, use them directly
        if (!foundProduct && actualPriceId.startsWith('price_')) {
          console.log(`Using direct price ID: ${actualPriceId}`);
          foundProduct = true;
        }
        
        // If we didn't find a mapping, check if the input is already a valid price ID
        if (!foundProduct) {
          throw new Error(`No Stripe price ID found for product: ${options.priceId}`);
        }
        
        console.log(`Creating checkout with actual Stripe priceId: ${actualPriceId}`);
        
        // Create the checkout
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: actualPriceId,
            profileId: options.profileId,
            email: options.email,
            successUrl,
            cancelUrl,
            promoCode: options.promoCode
          },
        });

        if (error) {
          console.error('Checkout creation error:', error);
          throw error;
        }
        
        console.log('Checkout created successfully:', JSON.stringify(data));
        return data;
      } catch (err) {
        console.error('Error creating checkout:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data && data.url) {
        toast({
          title: "Redirecting to Checkout",
          description: "Opening secure payment page in a new window.",
        });
        window.open(data.url, "_blank");
      } else {
        toast({
          title: "Error",
          description: "Could not create checkout session.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Error creating checkout session:', error);
      
      let errorMessage = "Failed to create checkout session. Please try again later.";
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes("promotion code")) {
          errorMessage = "The promotion code you entered is invalid or has expired.";
        } else if (error.message.includes("No Stripe price ID found")) {
          errorMessage = "Payment system is currently unavailable. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    createCheckout,
    isLoading: createCheckout.isPending,
    error: createCheckout.error,
  };
};
