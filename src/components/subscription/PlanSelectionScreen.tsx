
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import CheckoutButton from './CheckoutButton';
import LifetimeOfferBanner from './LifetimeOfferBanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Cookies from 'js-cookie';

const PlanSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  const { getPlanPrice, status, isStatusLoading } = useSubscriptionService(user?.id);
  
  useEffect(() => {
    const isAuthorized = Cookies.get('profile_authorized') === 'true';
    const profileId = Cookies.get('profile_id');
    const userEmail = Cookies.get('user_email');
    
    console.log("Plan selection auth check:", {
      isAuthorized, profileId, userEmail,
      allCookies: Object.keys(Cookies.get())
    });
    
    if (!isAuthorized || (!profileId && !userEmail)) {
      setShowAuthWarning(true);
    } else {
      setShowAuthWarning(false);
    }
  }, [user]);
  
  const isPremium = status?.isPremium || false;
  const isLifetime = status?.isLifetime || false;
  
  useEffect(() => {
    if (isLifetime && user?.id) {
      navigate(`/profile/${user.id}`);
      toast({
        title: "Already Subscribed",
        description: "You already have a lifetime subscription.",
      });
    }
  }, [isLifetime, user?.id, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upgrade to Narra+</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock premium features, unlimited stories, and more with Narra+
          </p>
        </div>
        
        {showAuthWarning && (
          <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 flex items-center justify-between">
              <span>Please sign in to complete your purchase. You need to be logged in to subscribe.</span>
              <Button 
                variant="default" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLogin', '/subscribe');
                  navigate('/sign-in?redirect=subscribe');
                }}
              >
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <LifetimeOfferBanner profileId={user?.id} />
        
        <Tabs defaultValue="annual" value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as any)} className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
            <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
          </TabsList>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className={`relative ${selectedPlan === 'monthly' ? 'border-2 border-purple-400 shadow-md' : ''}`}>
              <CardHeader>
                <CardTitle>Monthly</CardTitle>
                <CardDescription>Flexible month-to-month plan</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${getPlanPrice('monthly')}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited stories</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Premium voices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced editing tools</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <CheckoutButton 
                  planType="monthly"
                  profileId={user?.id}
                  email={user?.email}
                  promoCode={promoCode}
                  fullWidth
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Subscribe Monthly
                </CheckoutButton>
              </CardFooter>
            </Card>
            
            <Card className={`relative ${selectedPlan === 'annual' ? 'border-2 border-purple-400 shadow-md' : ''}`}>
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md">
                Best Value
              </div>
              <CardHeader>
                <CardTitle>Annual</CardTitle>
                <CardDescription>Save with yearly billing</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${getPlanPrice('annual')}</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All monthly plan features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Save 50% compared to monthly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority customer support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <CheckoutButton 
                  planType="annual"
                  profileId={user?.id}
                  email={user?.email}
                  promoCode={promoCode}
                  fullWidth
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Subscribe Yearly
                </CheckoutButton>
              </CardFooter>
            </Card>
            
            <Card className={`relative ${selectedPlan === 'lifetime' ? 'border-2 border-purple-400 shadow-md' : ''}`}>
              <CardHeader>
                <CardTitle>Lifetime</CardTitle>
                <CardDescription>One-time payment, forever access</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${getPlanPrice('lifetime')}</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All premium features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Never pay again</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>VIP support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <CheckoutButton 
                  planType="lifetime"
                  profileId={user?.id}
                  email={user?.email}
                  promoCode={promoCode}
                  fullWidth
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Lifetime Access
                </CheckoutButton>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-8 max-w-md mx-auto">
            <Label htmlFor="promo-code">Have a promo code?</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                id="promo-code" 
                placeholder="Enter promo code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button 
                variant="outline"
                onClick={() => {
                  if (promoCode) {
                    toast({
                      title: "Promo Code Applied",
                      description: "Your promo code will be applied at checkout.",
                    });
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </Tabs>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Need help? Contact support at <a href="mailto:support@narrastory.com" className="text-purple-600 hover:underline">support@narrastory.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
