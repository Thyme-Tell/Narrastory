
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

// Define product IDs - these should match price IDs from Stripe
export const STRIPE_PRODUCTS = {
  ANNUAL_PLUS: 'ANNUAL_PLUS',
  LIFETIME: 'LIFETIME',
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
        
        // Map the product key to the actual Stripe price ID
        let actualPriceId = options.priceId;
        let foundProduct = false;
        
        if (options.priceId === 'ANNUAL_PLUS' && setupData.annualPlus?.priceId) {
          actualPriceId = setupData.annualPlus.priceId;
          foundProduct = true;
        } else if (options.priceId === 'LIFETIME' && setupData.lifetime?.priceId) {
          actualPriceId = setupData.lifetime.priceId;
          foundProduct = true;
        } else if (options.priceId === 'FIRST_BOOK' && setupData.firstBook?.priceId) {
          actualPriceId = setupData.firstBook.priceId;
          foundProduct = true;
        } else if (options.priceId === 'ADDITIONAL_BOOK' && setupData.additionalBook?.priceId) {
          actualPriceId = setupData.additionalBook.priceId;
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
