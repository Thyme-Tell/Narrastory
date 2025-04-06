
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
        const { data: setupData, error: setupError } = await supabase.functions.invoke('get-stripe-products', {});
        
        if (setupError) {
          console.error('Error fetching Stripe products:', setupError);
          throw setupError;
        }
        
        if (!setupData) {
          throw new Error('No product data returned from setup function');
        }
        
        // Map the product key to the actual Stripe price ID
        let actualPriceId = options.priceId;
        
        if (options.priceId === 'ANNUAL_PLUS' && setupData.annualPlus?.priceId) {
          actualPriceId = setupData.annualPlus.priceId;
        } else if (options.priceId === 'LIFETIME' && setupData.lifetime?.priceId) {
          actualPriceId = setupData.lifetime.priceId;
        } else if (options.priceId === 'FIRST_BOOK' && setupData.firstBook?.priceId) {
          actualPriceId = setupData.firstBook.priceId;
        } else if (options.priceId === 'ADDITIONAL_BOOK' && setupData.additionalBook?.priceId) {
          actualPriceId = setupData.additionalBook.priceId;
        } else {
          // If we don't have a mapping, throw a helpful error
          console.error(`No Stripe price ID found for product: ${options.priceId}`);
          console.error('Available price IDs:', JSON.stringify(setupData));
          throw new Error(`The selected product is not available for purchase. Please try again later.`);
        }
        
        console.log(`Mapped priceId from ${options.priceId} to actual Stripe priceId: ${actualPriceId}`);
        
        // Now create the checkout with the actual price ID
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: actualPriceId,
            profileId: options.profileId,
            email: options.email,
            successUrl,
            cancelUrl,
          },
        });

        if (error) {
          console.error('Checkout creation error:', error);
          throw error;
        }
        
        return data;
      } catch (err) {
        console.error('Error creating checkout:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data && data.url) {
        toast({
          title: "Redirecting to Checkout",
          description: "Taking you to the secure payment page.",
        });
        window.location.href = data.url;
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
        }
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

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
    createAnnualCheckout,
    createLifetimeCheckout,
    createFirstBookCheckout,
    createAdditionalBookCheckout,
    isLoading: createCheckout.isPending,
    error: createCheckout.error,
  };
};
