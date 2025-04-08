
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useStripeCheckout, STRIPE_PRODUCTS } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PlanCard from './PlanCard';
import PromoCodeSection from './PromoCodeSection';
import CheckoutActions from './CheckoutActions';

// Define plan features for both plans
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

const PlanSelectionScreen: React.FC = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoValid, setIsPromoValid] = useState<boolean | null>(null);
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

  const validatePromoCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    
    // For this implementation, we'll simply return true to simulate validation
    // In a real implementation, you might want to check with Stripe or your backend
    // However, the actual validation will happen when creating the checkout session
    
    setIsPromoValid(true);
    return true;
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

      // Get the correct price ID based on the selected plan
      let priceId;
      if (selectedPlan === 'annual') {
        priceId = STRIPE_PRODUCTS.ANNUAL_PLUS;
        console.log(`Selected ANNUAL plan, using priceId: ${priceId}`);
      } else {
        priceId = STRIPE_PRODUCTS.LIFETIME;
        console.log(`Selected LIFETIME plan, using priceId: ${priceId}`);
      }
      
      await createCheckout.mutateAsync({
        priceId: priceId,
        profileId: userProfileId,
        promoCode: isPromoValid ? promoCode : undefined
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
        <PlanCard
          title="Annual Plan"
          description="Yearly subscription"
          price="$249"
          interval="/ year"
          features={planFeatures.annual}
          isSelected={selectedPlan === 'annual'}
          onSelect={() => handlePlanSelection('annual')}
        />
        
        <PlanCard
          title="Lifetime Access"
          description="One-time payment"
          price="$399"
          interval="one-time"
          features={planFeatures.lifetime}
          isSelected={selectedPlan === 'lifetime'}
          isBestValue={true}
          onSelect={() => handlePlanSelection('lifetime')}
          footnote="* Subject to fair usage policy."
        />
      </div>
      
      <PromoCodeSection
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        isLoading={isLoading || isCheckoutLoading}
        onApplyPromoCode={validatePromoCode}
      />
      
      <CheckoutActions
        isLoading={isLoading || isCheckoutLoading}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default PlanSelectionScreen;
