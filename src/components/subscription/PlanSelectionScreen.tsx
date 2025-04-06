
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Clock, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LifetimeTimer from './LifetimeTimer';
import { useToast } from '@/hooks/use-toast';

const PlanSelectionScreen: React.FC = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'lifetime'>('lifetime');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<{
    plus: boolean;
    lifetime: boolean;
  }>({ plus: true, lifetime: true });
  
  const { getPlanPrice } = useSubscriptionService(profileId);
  const { 
    createAnnualCheckout, 
    createLifetimeCheckout,
    isLoading: isCheckoutLoading,
  } = useStripeCheckout();
  
  const plusPrice = getPlanPrice('plus');
  const lifetimePrice = getPlanPrice('lifetime');
  
  // Check available plans
  useEffect(() => {
    const checkAvailablePlans = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-stripe-products', {});
        
        const hasAnnual = !!(data?.annualPlus?.priceId);
        const hasLifetime = !!(data?.lifetime?.priceId);
        
        setAvailablePlans({
          plus: hasAnnual,
          lifetime: hasLifetime
        });
        
        // If annual isn't available but lifetime is, auto-select lifetime
        if (!hasAnnual && hasLifetime && selectedPlan === 'plus') {
          setSelectedPlan('lifetime');
        }
        
        setProductsLoaded(true);
      } catch (error) {
        console.error("Error checking available plans:", error);
        // Default to assuming both are available
        setAvailablePlans({ plus: true, lifetime: true });
        setProductsLoaded(true);
      }
    };
    
    checkAvailablePlans();
  }, []);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handlePlanSelection = (plan: 'plus' | 'lifetime') => {
    setSelectedPlan(plan);
    setError(null); // Clear any previous errors
  };
  
  const handleContinue = async () => {
    if (!profileId) {
      setError("User profile not found. Please sign in and try again.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedPlan === 'plus') {
        toast({
          title: "Creating Checkout",
          description: "Setting up your subscription checkout...",
        });
        await createAnnualCheckout(profileId);
      } else {
        toast({
          title: "Creating Checkout",
          description: "Setting up your lifetime access checkout...",
        });
        await createLifetimeCheckout(profileId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = "Could not process payment request. Please try again later.";
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("not available for purchase")) {
          errorMessage = "The selected product is not available for purchase. The store may still be setting up.";
        } else if (error.message.includes("Annual subscription is not available")) {
          errorMessage = "Annual subscription is not available at this time. Please select the Lifetime option.";
          setSelectedPlan('lifetime');
        } else if (error.message.includes("No such price")) {
          errorMessage = "Payment plans are being updated. Please try again in a few minutes.";
        } else if (error.message.includes("API Key")) {
          errorMessage = "Payment system is currently unavailable. Please contact support.";
        } else {
          // If we have a specific error message, use that
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const planFeatures = {
    plus: [
      "Print on-demand books",
      "AI voice narration",
      "Access to premium templates",
      "Book printing credits (2 per year)"
    ],
    lifetime: [
      "Everything in Plus",
      "Forever access, no recurring payments",
      "Priority customer support",
      "Unlimited book credits*",
      "Early access to new features"
    ]
  };
  
  if (!productsLoaded) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E59A5]"></div>
          <span className="ml-3">Loading available plans...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
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
        <h1 className="text-2xl font-bold font-serif">Choose Your Plan</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!availablePlans.plus && (
        <Alert variant="default" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>
            Annual subscription is currently unavailable. Only the Lifetime plan is available for purchase.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plus Plan */}
        <Card 
          className={`border-2 ${selectedPlan === 'plus' ? 'border-[#6E59A5]' : 'border-gray-200'} transition-all hover:shadow-md ${!availablePlans.plus ? 'opacity-50' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-serif">Plus Plan</CardTitle>
                <CardDescription>Annual subscription</CardDescription>
              </div>
              <Button 
                variant={selectedPlan === 'plus' ? 'default' : 'outline'} 
                size="sm"
                className={selectedPlan === 'plus' ? 'bg-[#6E59A5] hover:bg-[#5d4a8a]' : ''}
                onClick={() => handlePlanSelection('plus')}
                disabled={!availablePlans.plus}
              >
                {selectedPlan === 'plus' ? 'Selected' : 'Select'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-2xl font-bold">${plusPrice}</span>
              <span className="text-gray-500 ml-1">/ year</span>
            </div>
            <ul className="space-y-2">
              {planFeatures.plus.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            {!availablePlans.plus && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                Currently unavailable
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Lifetime Plan */}
        <Card className={`border-2 ${selectedPlan === 'lifetime' ? 'border-[#6E59A5]' : 'border-gray-200'} transition-all hover:shadow-md relative overflow-hidden ${!availablePlans.lifetime ? 'opacity-50' : ''}`}>
          <div className="absolute top-0 right-0 bg-[#6E59A5] text-white px-3 py-1 text-xs font-semibold">
            MOST POPULAR
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-serif">Lifetime Access</CardTitle>
                <CardDescription>One-time payment</CardDescription>
              </div>
              <Button 
                variant={selectedPlan === 'lifetime' ? 'default' : 'outline'} 
                size="sm"
                className={selectedPlan === 'lifetime' ? 'bg-[#6E59A5] hover:bg-[#5d4a8a]' : ''}
                onClick={() => handlePlanSelection('lifetime')}
                disabled={!availablePlans.lifetime}
              >
                {selectedPlan === 'lifetime' ? 'Selected' : 'Select'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-2xl font-bold">${lifetimePrice}</span>
              <span className="text-gray-500 ml-1">one-time</span>
            </div>
            <div className="mb-4">
              <LifetimeTimer 
                expiryTimestamp={new Date(Date.now() + 24 * 60 * 60 * 1000)} 
                compact={true}
              />
            </div>
            <ul className="space-y-2">
              {planFeatures.lifetime.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              * Subject to fair usage policy. 
            </p>
            {!availablePlans.lifetime && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                Currently unavailable
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex flex-col md:flex-row md:justify-between gap-4">
        <div className="text-sm text-gray-500">
          <p>All plans include a 30-day money-back guarantee.</p>
          <p>By continuing, you agree to our Terms and Conditions.</p>
        </div>
        <Button 
          size="lg" 
          className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
          onClick={handleContinue}
          disabled={isLoading || isCheckoutLoading || 
                  (selectedPlan === 'plus' && !availablePlans.plus) || 
                  (selectedPlan === 'lifetime' && !availablePlans.lifetime)}
        >
          {isLoading || isCheckoutLoading ? (
            <>Processing...</>
          ) : (
            <>Continue to Checkout</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
