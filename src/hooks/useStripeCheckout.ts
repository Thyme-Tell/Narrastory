
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

// Define product IDs
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
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: options.priceId,
            profileId: options.profileId,
            email: options.email,
            successUrl,
            cancelUrl,
          },
        });

        if (error) {
          console.error('Checkout creation error:', error);
          toast({
            title: "Checkout Error",
            description: error.message || "Failed to create checkout session",
            variant: "destructive",
          });
          throw error;
        }
        
        return data;
      } catch (err) {
        console.error('Error creating checkout:', err);
        toast({
          title: "Checkout Error",
          description: "Could not create checkout session. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        toast({
          title: "Redirecting to Checkout",
          description: "Taking you to the secure payment page.",
        });
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Could not create checkout session",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  // Helper function to create checkout for annual subscription
  const createAnnualCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: Deno.env.get('STRIPE_ANNUAL_PLUS_PRICE_ID') || '',
      profileId,
      email,
    });
  };

  // Helper function to create checkout for lifetime access
  const createLifetimeCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: Deno.env.get('STRIPE_LIFETIME_PRICE_ID') || '',
      profileId,
      email,
    });
  };

  // Helper function to create checkout for first book
  const createFirstBookCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: Deno.env.get('STRIPE_FIRST_BOOK_PRICE_ID') || '',
      profileId,
      email,
    });
  };

  // Helper function to create checkout for additional book
  const createAdditionalBookCheckout = (profileId?: string, email?: string) => {
    return createCheckout.mutate({
      priceId: Deno.env.get('STRIPE_ADDITIONAL_BOOK_PRICE_ID') || '',
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
