import React, { useEffect, useState } from 'react';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { PlanType, PLAN_DETAILS } from '@/types/subscription';

interface SubscriptionInfoProps {
  profileId?: string;
  showManagement?: boolean;
  email?: string;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ 
  profileId,
  showManagement = true,
  email: initialEmail
}) => {
  // State to store fetched email if not provided
  const [userEmail, setUserEmail] = useState<string | undefined>(initialEmail);
  
  // Fetch profile email if not provided and we have a profileId
  useEffect(() => {
    const fetchEmail = async () => {
      if (!initialEmail && profileId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profileId)
            .maybeSingle();
            
          if (!error && data?.email) {
            console.log(`Fetched email ${data.email} for profile ${profileId}`);
            setUserEmail(data.email);
          }
        } catch (err) {
          console.error('Error fetching user email:', err);
        }
      }
    };
    
    fetchEmail();
  }, [profileId, initialEmail]);
  
  // Now use both profileId and email for subscription lookup
  const { 
    status, 
    isStatusLoading,
    changePlan,
    isChangingPlan,
    getPlanPrice,
    getPlanDetails
  } = useSubscriptionService(profileId, undefined, userEmail);

  const handleUpgradeToPlan = (plan: PlanType) => {
    if (profileId) {
      changePlan({
        fromPlan: status.planType,
        toPlan: plan,
        userId: profileId
      });
    }
  };

  const handleCancelSubscription = () => {
    if (profileId && status.planType !== 'free') {
      changePlan({
        fromPlan: status.planType,
        toPlan: 'free',
        userId: profileId
      });
    }
  };

  if (isStatusLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Format expiration date if available
  const formattedExpirationDate = status.expirationDate
    ? format(status.expirationDate, 'MMM d, yyyy')
    : null;

  // Format purchase date if available
  const formattedPurchaseDate = status.purchaseDate
    ? format(status.purchaseDate, 'MMM d, yyyy')
    : null;

  // Determine the badge class based on plan type
  const getBadgeClass = () => {
    if (status.isLifetime) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (status.planType === 'annual' || status.planType === 'plus') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (status.planType === 'monthly') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return '';
  };

  // Get the user-friendly name for the plan
  const getPlanName = () => {
    const planDetails = getPlanDetails(status.planType);
    return planDetails.name;
  };

  // Get the display status for the subscription
  const getDisplayStatus = () => {
    if (status.isLifetime) {
      return 'Active (Lifetime)';
    }
    
    if (status.status === 'active') {
      return status.cancelAtPeriodEnd ? 'Active (Canceling)' : 'Active';
    }
    
    if (status.status === 'trialing') {
      return 'Trial';
    }
    
    if (status.status === 'past_due') {
      return 'Past Due (Payment Failed)';
    }
    
    return status.status ? status.status.charAt(0).toUpperCase() + status.status.slice(1) : 'N/A';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription</CardTitle>
          {status.isPremium && (
            <Badge variant="outline" className={getBadgeClass()}>
              {status.isLifetime ? 'Lifetime' : 
               (status.planType === 'monthly' ? 'Monthly' : 
               (status.planType === 'annual' || status.planType === 'plus' ? 'Annual' : 'Premium'))}
            </Badge>
          )}
        </div>
        <CardDescription>
          Your current subscription details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="font-medium">{getPlanName()}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex items-center">
                {status.lastPaymentStatus === 'failed' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                ) : status.isPremium ? (
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                ) : null}
                <p className="font-medium">{getDisplayStatus()}</p>
              </div>
            </div>
            
            {status.bookCredits > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Book Credits</p>
                <p className="font-medium">{status.bookCredits}</p>
              </div>
            )}
            
            {status.isLifetime ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expires</p>
                <p className="font-medium">Never (Lifetime)</p>
              </div>
            ) : formattedExpirationDate && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Renews/Expires</p>
                <p className="font-medium">{formattedExpirationDate}</p>
              </div>
            )}

            {formattedPurchaseDate && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Purchased</p>
                <p className="font-medium">{formattedPurchaseDate}</p>
              </div>
            )}

            {status.orderId && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p className="font-medium text-xs">{status.orderId}</p>
              </div>
            )}
          </div>

          {/* Features section */}
          {status.features && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Features</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm flex items-center">
                  <Check className={`h-4 w-4 mr-1 ${status.features.aiGeneration ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>AI Generation</span>
                </div>
                <div className="text-sm flex items-center">
                  <Check className={`h-4 w-4 mr-1 ${status.features.customTTS ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Custom Voice</span>
                </div>
                <div className="text-sm flex items-center">
                  <Check className={`h-4 w-4 mr-1 ${status.features.advancedEditing ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Advanced Editing</span>
                </div>
                <div className="text-sm flex items-center">
                  <Check className={`h-4 w-4 mr-1 ${status.features.prioritySupport ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Priority Support</span>
                </div>
                <div className="text-sm flex items-center col-span-2">
                  <span className="mr-1">Books:</span>
                  <span className="font-medium">{status.features.booksLimit}</span>
                </div>
                <div className="text-sm flex items-center col-span-2">
                  <span className="mr-1">Storage:</span>
                  <span className="font-medium">{status.features.storageLimit} MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {showManagement && (
        <CardFooter className="flex flex-col space-y-2">
          {!status.isPremium && (
            <div className="w-full space-y-2">
              <Button 
                onClick={() => handleUpgradeToPlan('monthly')}
                disabled={isChangingPlan}
                className="w-full"
              >
                {isChangingPlan ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Monthly Premium - ${getPlanPrice('monthly')}/month
              </Button>
              <Button 
                onClick={() => handleUpgradeToPlan('annual')}
                disabled={isChangingPlan}
                className="w-full"
              >
                {isChangingPlan ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Annual Premium - ${getPlanPrice('annual')}/year
              </Button>
              <Button 
                onClick={() => handleUpgradeToPlan('lifetime')}
                disabled={isChangingPlan}
                variant="outline"
                className="w-full"
              >
                Lifetime Access - ${getPlanPrice('lifetime')}
              </Button>
            </div>
          )}
          
          {status.isPremium && !status.isLifetime && (
            <div className="w-full space-y-2">
              {status.planType === 'monthly' && (
                <Button 
                  onClick={() => handleUpgradeToPlan('annual')}
                  disabled={isChangingPlan}
                  className="w-full"
                >
                  Upgrade to Annual - ${getPlanPrice('annual')}/year
                </Button>
              )}
              
              {(status.planType === 'monthly' || status.planType === 'annual' || status.planType === 'plus') && (
                <Button 
                  onClick={() => handleUpgradeToPlan('lifetime')}
                  disabled={isChangingPlan}
                  className="w-full"
                >
                  Upgrade to Lifetime - ${getPlanPrice('lifetime')}
                </Button>
              )}
              
              <Button 
                onClick={handleCancelSubscription}
                disabled={isChangingPlan}
                variant="outline"
                className="w-full text-red-500 hover:text-red-600"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SubscriptionInfo;
