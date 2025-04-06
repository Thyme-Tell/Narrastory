
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Shield, AlertCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';
import LifetimeTimer from './LifetimeTimer';

interface CheckoutState {
  status: 'idle' | 'loading' | 'error' | 'success';
  error?: string;
}

const LifetimeCheckout: React.FC = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle' });
  const [couponCode, setCouponCode] = useState('');
  
  const { getPlanPrice, status } = useSubscriptionService(profileId);
  const { createLifetimeCheckout, createCheckout, isLoading } = useStripeCheckout();
  
  const lifetimePrice = getPlanPrice('lifetime');
  
  useEffect(() => {
    // If user already has lifetime access, redirect them back
    if (status.isLifetime) {
      toast({
        title: "Already Purchased",
        description: "You already have lifetime access to all premium features.",
      });
      navigate(`/profile/${profileId}`);
    }
  }, [status.isLifetime, profileId, navigate, toast]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCheckout = async () => {
    if (!profileId) {
      setCheckoutState({ 
        status: 'error', 
        error: "User profile not found. Please sign in and try again."
      });
      return;
    }
    
    setCheckoutState({ status: 'loading' });
    
    try {
      toast({
        title: "Creating Checkout",
        description: "Setting up your lifetime access checkout...",
      });
      
      // Use direct checkout to pass coupon code
      await createCheckout({
        priceId: 'LIFETIME',
        profileId,
        couponCode: couponCode.trim() || undefined
      });
      
      // Note: The redirect happens in the useStripeCheckout hook
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = "Payment processing is currently unavailable. Please try again later.";
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("not available for purchase")) {
          errorMessage = "The lifetime plan is not available for purchase at this time. Please try again later.";
        } else if (error.message.includes("No such price")) {
          errorMessage = "Payment plans are being updated. Please try again in a few minutes.";
        } else if (error.message.includes("API Key")) {
          errorMessage = "Payment system is currently unavailable. Please contact support.";
        } else {
          // If we have a specific error message, use that
          errorMessage = error.message;
        }
      }
      
      setCheckoutState({ 
        status: 'error', 
        error: errorMessage
      });
    }
  };
  
  const benefits = [
    "Unlimited stories and books",
    "Premium voice narration",
    "Priority customer support", 
    "Early access to new features",
    "No recurring charges ever"
  ];
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2" 
          size="sm"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold font-serif">Lifetime Access</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Complete Your Purchase</CardTitle>
              <CardDescription>One-time payment for lifetime access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Lifetime Access</span>
                  <span className="font-bold">${lifetimePrice}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Total (USD)</span>
                  <span className="text-lg font-bold">${lifetimePrice}</span>
                </div>
                
                {/* Coupon code input */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter coupon code (if available)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-10"
                  />
                  <Ticket className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
                
                <LifetimeTimer 
                  expiryTimestamp={new Date(Date.now() + 24 * 60 * 60 * 1000)} 
                />
                
                {checkoutState.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {checkoutState.error || "Something went wrong. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full bg-[#6E59A5] hover:bg-[#5d4a8a]"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading || checkoutState.status === 'loading'}
                >
                  {isLoading || checkoutState.status === 'loading' ? (
                    <>Processing...</>
                  ) : (
                    <>Complete Purchase</>
                  )}
                </Button>
                
                <div className="flex items-center justify-center text-xs text-gray-500 gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-4" />
              
              <div className="text-xs text-gray-500 space-y-2">
                <p>30-day money-back guarantee</p>
                <p>Lifetime access, no recurring charges</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LifetimeCheckout;
