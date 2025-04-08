
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const {
    createCheckout,
    isLoading,
    createAnnualCheckout,
    createLifetimeCheckout,
    createMonthlyCheckout
  } = useStripeCheckout();

  // Check authentication status on mount and when cookies change
  useEffect(() => {
    const checkAuth = () => {
      const authCookie = Cookies.get('profile_authorized');
      console.log('CheckoutButton authentication check:', { 
        authCookie, 
        allCookies: Object.keys(Cookies.get())
      });
      setIsAuthenticated(authCookie === 'true');
    };
    
    // Check immediately
    checkAuth();
    
    // Also set up a listener for the storage event (when cookies change)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCheckout = async () => {
    // Get the latest auth state from cookies
    const authCookie = Cookies.get('profile_authorized');
    const effectiveProfileId = profileId || Cookies.get('profile_id');
    const effectiveEmail = email || Cookies.get('user_email');
    
    console.log("Checkout attempt with:", { 
      planType,
      profileId: effectiveProfileId, 
      email: effectiveEmail,
      cookieAuth: authCookie,
      allCookies: Object.keys(Cookies.get())
    });

    // Verify authentication
    if (authCookie !== 'true' || (!effectiveProfileId && !effectiveEmail)) {
      console.log("User not authenticated for checkout, redirecting to sign in");
      
      // Store current route for redirect back after login
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // If no user info or not authorized, redirect to sign in page with redirect back to subscribe
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive",
      });
      
      navigate('/sign-in?redirect=subscribe');
      return;
    }

    try {
      console.log(`Creating checkout for plan: ${planType}`);
      switch (planType) {
        case 'annual':
          createAnnualCheckout(effectiveProfileId, effectiveEmail, promoCode);
          break;
        case 'lifetime':
          createLifetimeCheckout(effectiveProfileId, effectiveEmail, promoCode);
          break;
        case 'monthly':
          createMonthlyCheckout(effectiveProfileId, effectiveEmail, promoCode);
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
      disabled={isLoading || isAuthenticated === false}
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
