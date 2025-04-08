import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, AlertCircle, Info, Tag } from 'lucide-react';
import { useStripeCheckout, STRIPE_PRODUCTS } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const PlanSelectionScreen: React.FC = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { 
    createCheckout, 
    isLoading: isCheckoutLoading 
  } = useStripeCheckout();

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handlePlanSelection = (plan: 'annual' | 'lifetime') => {
    setSelectedPlan(plan);
    setError(null);
  };
  
  const handleContinue = async () => {
    const userProfileId = profileId || user?.id;
    
    if (!userProfileId) {
      setError("Please sign in to continue.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      toast({
        title: "Creating Checkout",
        description: promoCode 
          ? `Setting up checkout with promo code ${promoCode}...` 
          : "Setting up checkout...",
      });

      if (selectedPlan === 'lifetime') {
        navigate(`/lifetime-checkout/${userProfileId}`);
        return;
      }
      
      await createCheckout.mutateAsync({
        priceId: STRIPE_PRODUCTS.ANNUAL_PLUS, // Using the actual product ID
        profileId: userProfileId,
        promoCode: promoCode || undefined
      });
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = "Could not process payment request. Please try again later.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const planFeatures = {
    annual: [
      "Annual subscription with premium features",
      "Print on-demand books",
      "AI voice narration",
      "Access to premium templates",
      "Book printing credits (2 per year)"
    ],
    lifetime: [
      "One-time payment for lifetime access",
      "All premium features forever",
      "Priority customer support",
      "Unlimited book credits*",
      "Early access to new features"
    ]
  };
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`border-2 ${selectedPlan === 'annual' ? 'border-[#6E59A5]' : 'border-gray-200'} transition-all hover:shadow-md`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-serif">Annual Plan</CardTitle>
                <CardDescription>Yearly subscription</CardDescription>
              </div>
              <Button 
                variant={selectedPlan === 'annual' ? 'default' : 'outline'} 
                size="sm"
                className={selectedPlan === 'annual' ? 'bg-[#6E59A5] hover:bg-[#5d4a8a]' : ''}
                onClick={() => handlePlanSelection('annual')}
              >
                {selectedPlan === 'annual' ? 'Selected' : 'Select'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-2xl font-bold">$249</span>
              <span className="text-gray-500 ml-1">/ year</span>
            </div>
            <ul className="space-y-2">
              {planFeatures.annual.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className={`border-2 ${selectedPlan === 'lifetime' ? 'border-[#6E59A5]' : 'border-gray-200'} transition-all hover:shadow-md relative overflow-hidden`}>
          <div className="absolute top-0 right-0 bg-[#6E59A5] text-white px-3 py-1 text-xs font-semibold">
            BEST VALUE
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
              >
                {selectedPlan === 'lifetime' ? 'Selected' : 'Select'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-2xl font-bold">$399</span>
              <span className="text-gray-500 ml-1">one-time</span>
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
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center mb-2">
          <Tag className="h-4 w-4 mr-2 text-[#6E59A5]" />
          <h3 className="font-medium">Promo Code</h3>
        </div>
        <div className="flex gap-2">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="max-w-xs"
            disabled={isLoading || isCheckoutLoading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          If you have a promotional code, enter it above to receive your discount.
        </p>
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
          disabled={isLoading || isCheckoutLoading}
        >
          {isLoading || isCheckoutLoading ? (
            <>
              <span className="mr-2">
                <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
              </span>
              Processing...
            </>
          ) : (
            <>Continue to Checkout</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
