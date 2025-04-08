
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
  MONTHLY: 'prod_S52CgwPdKwxgXM',       // Narra+ Monthly
  ANNUAL_PLUS: 'prod_S52DtoQFIZmzDL',   // Narra+ Yearly
  LIFETIME: 'prod_S52DRcMxeWMRQ6',      // Narra+ Lifetime
  FIRST_BOOK: 'FIRST_BOOK',             // Kept for backward compatibility
  ADDITIONAL_BOOK: 'ADDITIONAL_BOOK',   // Kept for backward compatibility
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
      // Validate required user information
      if (!options.profileId && !options.email) {
        throw new Error('User information is required to proceed with checkout');
      }
      
      // Set default success and cancel URLs if not provided
      const origin = window.location.origin;
      const successUrl = options.successUrl || `${origin}/payment-success`;
      const cancelUrl = options.cancelUrl || `${origin}/payment-canceled`;

      try {
        console.log(`Creating checkout with priceId: ${options.priceId}`);
        
        // Call the create-checkout edge function to create a checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: options.priceId,
            profileId: options.profileId,
            email: options.email,
            successUrl,
            cancelUrl,
            promoCode: options.promoCode // Pass the promo code to the API
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
        // Improved error handling for common issues
        if (error.message.includes("promotion code")) {
          errorMessage = "The promotion code you entered is invalid or has expired.";
        } else if (error.message.includes("API Key")) {
          errorMessage = "Payment system is not properly configured. Please contact support.";
        } else if (error.message.includes("No such price")) {
          errorMessage = "The selected payment plan is currently unavailable. Please contact support.";
        } else if (error.message.includes("User information is required")) {
          errorMessage = "Please sign in to complete your purchase.";
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
  const createMonthlyCheckout = (profileId?: string, email?: string, promoCode?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.MONTHLY,
      profileId,
      email,
      promoCode,
    });
  };

  // Helper function to create checkout for annual subscription
  const createAnnualCheckout = (profileId?: string, email?: string, promoCode?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.ANNUAL_PLUS,
      profileId,
      email,
      promoCode,
    });
  };

  // Helper function to create checkout for lifetime access
  const createLifetimeCheckout = (profileId?: string, email?: string, promoCode?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.LIFETIME,
      profileId,
      email,
      promoCode,
    });
  };

  // Helper functions for book credits - kept for backward compatibility
  const createFirstBookCheckout = (profileId?: string, email?: string, promoCode?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.FIRST_BOOK,
      profileId,
      email,
      promoCode,
    });
  };

  const createAdditionalBookCheckout = (profileId?: string, email?: string, promoCode?: string) => {
    return createCheckout.mutate({
      priceId: STRIPE_PRODUCTS.ADDITIONAL_BOOK,
      profileId,
      email,
      promoCode,
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
