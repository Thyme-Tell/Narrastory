
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
}

// Define product IDs - these should match price IDs from Stripe
// Note: These are symbolic constants that will be mapped to actual Stripe price IDs
export const STRIPE_PRODUCTS = {
  MONTHLY_PREMIUM: 'MONTHLY_PREMIUM',
  ANNUAL_PLUS: 'ANNUAL_PLUS',
  LIFETIME: 'LIFETIME',
  FIRST_BOOK: 'FIRST_BOOK',
  ADDITIONAL_BOOK: 'ADDITIONAL_BOOK',
};

/**
 * Hook to create and redirect to Stripe checkout sessions
 * 
 * @returns Object with createCheckout mutation
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
        
        // First, retrieve the actual Stripe price IDs from the setup function
        console.log("Fetching Stripe products data...");
        const { data: setupData, error: setupError } = await supabase.functions.invoke('get-stripe-products', {});
        
        if (setupError) {
          console.error('Error fetching Stripe products:', setupError);
          throw setupError;
        }
        
        if (!setupData) {
          console.error('No setup data returned from get-stripe-products function');
          throw new Error('No product data returned from setup function');
        }
        
        console.log('Retrieved Stripe products data:', JSON.stringify(setupData));
        
        // Map the product key to the actual Stripe price ID
        let actualPriceId = options.priceId;
        let foundProduct = false;
        let productDetails = null;
        
        // IMPROVED: Better detection and mapping for requested product
        if (options.priceId === 'MONTHLY_PREMIUM' && setupData.monthlyPremium && setupData.monthlyPremium.priceId) {
          actualPriceId = setupData.monthlyPremium.priceId;
          productDetails = setupData.monthlyPremium;
          console.log(`Mapped MONTHLY_PREMIUM to Stripe priceId: ${actualPriceId}`);
          console.log(`Product details: ${setupData.monthlyPremium.productName}, Amount: ${setupData.monthlyPremium.amount}`);
          foundProduct = true;
        } else if (options.priceId === 'ANNUAL_PLUS' && setupData.annualPlus && setupData.annualPlus.priceId) {
          actualPriceId = setupData.annualPlus.priceId;
          productDetails = setupData.annualPlus;
          console.log(`Mapped ANNUAL_PLUS to Stripe priceId: ${actualPriceId}`);
          console.log(`Product details: ${setupData.annualPlus.productName}, Amount: ${setupData.annualPlus.amount}`);
          foundProduct = true;
        } else if (options.priceId === 'LIFETIME' && setupData.lifetime && setupData.lifetime.priceId) {
          actualPriceId = setupData.lifetime.priceId;
          productDetails = setupData.lifetime;
          console.log(`Mapped LIFETIME to Stripe priceId: ${actualPriceId}`);
          console.log(`Product details: ${setupData.lifetime.productName}, Amount: ${setupData.lifetime.amount}`);
          foundProduct = true;
        } else if (options.priceId === 'FIRST_BOOK' && setupData.firstBook && setupData.firstBook.priceId) {
          actualPriceId = setupData.firstBook.priceId;
          productDetails = setupData.firstBook;
          console.log(`Mapped FIRST_BOOK to Stripe priceId: ${actualPriceId}`);
          console.log(`Product details: ${setupData.firstBook.productName}, Amount: ${setupData.firstBook.amount}`);
          foundProduct = true;
        } else if (options.priceId === 'ADDITIONAL_BOOK' && setupData.additionalBook && setupData.additionalBook.priceId) {
          actualPriceId = setupData.additionalBook.priceId;
          productDetails = setupData.additionalBook;
          console.log(`Mapped ADDITIONAL_BOOK to Stripe priceId: ${actualPriceId}`);
          console.log(`Product details: ${setupData.additionalBook.productName}, Amount: ${setupData.additionalBook.amount}`);
          foundProduct = true;
        }
        
        // If we didn't find a mapping, check if the input is already a valid price ID
        if (!foundProduct) {
          // Check if this is already a known price ID that exists in our product data
          const allProducts = Object.values(setupData);
          for (const product of allProducts) {
            if (product && typeof product === 'object' && 'priceId' in product && product.priceId === options.priceId) {
              actualPriceId = options.priceId;
              productDetails = product;
              console.log(`Using directly provided Stripe priceId: ${actualPriceId}`);
              foundProduct = true;
              break;
            }
          }
        }
        
        // Provide better error handling for missing products
        if (!foundProduct) {
          console.error(`No Stripe price ID found for product: ${options.priceId}`);
          console.error('Available price IDs:', JSON.stringify(setupData));
          
          // Special case for subscription products
          if (options.priceId === 'MONTHLY_PREMIUM' && !setupData.monthlyPremium) {
            if (setupData.lifetime) {
              throw new Error(`The Monthly subscription is not available at this time. Please try the Lifetime option instead.`);
            } else if (setupData.annualPlus) {
              throw new Error(`The Monthly subscription is not available at this time. Please try the Annual option instead.`);
            }
          } else if (options.priceId === 'ANNUAL_PLUS' && !setupData.annualPlus) {
            if (setupData.lifetime) {
              throw new Error(`The Annual subscription is not available at this time. Please try the Lifetime option instead.`);
            } else if (setupData.monthlyPremium) {
              throw new Error(`The Annual subscription is not available at this time. Please try the Monthly option instead.`);
            }
          } else {
            throw new Error(`The selected product is not available for purchase. Please try again later.`);
          }
        }
        
        console.log(`Creating checkout with actual Stripe priceId: ${actualPriceId}`);
        
        // IMPROVED: Determine mode based on product type
        const mode = productDetails?.isRecurring ? 'subscription' : 'payment';
        console.log(`Checkout mode: ${mode} (based on product type)`);
        
        // Now create the checkout with the actual price ID
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: actualPriceId,
            profileId: options.profileId,
            email: options.email,
            successUrl,
            cancelUrl,
            mode: mode // Pass the mode to the API
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
      // Open Stripe Checkout in a new window instead of redirecting
      if (data && data.url) {
        toast({
          title: "Redirecting to Checkout",
          description: "Opening secure payment page in a new window.",
        });
        
        // Open in a new tab/window instead of redirecting the current page
        window.open(data.url, "_blank");
      } else {
        toast({
          title: "Error",
          description: "Could not create checkout session. Missing redirect URL.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Error creating checkout session:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "Failed to create checkout session. Please try again later.";
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes("API Key")) {
          errorMessage = "Payment system is not properly configured. Please contact support.";
        } else if (error.message.includes("No such price")) {
          errorMessage = "The selected payment plan is currently unavailable. Please contact support.";
        } else if (error.message.includes("not available for purchase")) {
          errorMessage = error.message;
        } else if (error.message.includes("subscription is not available")) {
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

  // Helper function to create checkout for monthly subscription
  const createMonthlyCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.MONTHLY_PREMIUM,
      profileId,
      email,
    });
  };

  // Helper function to create checkout for annual subscription
  const createAnnualCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.ANNUAL_PLUS,
      profileId,
      email,
    });
  };

  // Helper function to create checkout for lifetime access
  const createLifetimeCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.LIFETIME,
      profileId,
      email,
    });
  };

  // Helper function to create checkout for first book
  const createFirstBookCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.FIRST_BOOK,
      profileId,
      email,
    });
  };

  // Helper function to create checkout for additional book
  const createAdditionalBookCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.ADDITIONAL_BOOK,
      profileId,
      email,
    });
  };

  return {
    createCheckout,
    createMonthlyCheckout,
    createAnnualCheckout,
    createLifetimeCheckout,
    createFirstBookCheckout,
    createAdditionalBookCheckout,
    isLoading: createCheckout.isPending,
    error: createCheckout.error,
  };
};
