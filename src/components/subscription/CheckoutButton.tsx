
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const {
    createCheckout,
    isLoading,
    createAnnualCheckout,
    createLifetimeCheckout,
    createMonthlyCheckout
  } = useStripeCheckout();

  const handleCheckout = async () => {
    if (!profileId && !email) {
      // If no user info, redirect to sign in page
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive",
      });
      navigate('/sign-in?redirect=subscribe');
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
          createMonthlyCheckout(profileId, email, promoCode);
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
