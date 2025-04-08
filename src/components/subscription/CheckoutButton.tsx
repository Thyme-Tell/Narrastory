
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'annual' | 'lifetime' | 'monthly';

interface CheckoutButtonProps {
  planType: PlanType;
  profileId?: string;
  email?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  promoCode?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  planType,
  profileId,
  email,
  className,
  variant = 'default',
  size = 'default',
  promoCode,
  fullWidth = false,
  children,
}) => {
  const { toast } = useToast();
  const {
    createCheckout,
    isLoading,
    createAnnualCheckout,
    createLifetimeCheckout,
  } = useStripeCheckout();

  const handleCheckout = async () => {
    if (!profileId && !email) {
      toast({
        title: "Error",
        description: "User information is required to proceed with checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (planType) {
        case 'annual':
          createAnnualCheckout(profileId, email, promoCode);
          break;
        case 'lifetime':
          createLifetimeCheckout(profileId, email, promoCode);
          break;
        case 'monthly':
          // For monthly, use the direct createCheckout method with the correct price ID
          createCheckout.mutate({
            priceId: 'prod_MONTHLY_ID', // You'll need to add this to STRIPE_PRODUCTS in useStripeCheckout
            profileId,
            email,
            promoCode,
          });
          break;
        default:
          throw new Error(`Unknown plan type: ${planType}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading}
      onClick={handleCheckout}
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </Button>
  );
};

export default CheckoutButton;
