
import React from 'react';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface SubscriptionInfoProps {
  profileId?: string;
  showManagement?: boolean;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ 
  profileId,
  showManagement = true
}) => {
  const { 
    status, 
    isStatusLoading,
    changePlan,
    isChangingPlan,
    getPlanPrice
  } = useSubscriptionService(profileId);

  const handleUpgradeToPro = () => {
    if (profileId) {
      changePlan({
        fromPlan: status.planType,
        toPlan: 'plus',
        userId: profileId
      });
    }
  };

  const handleUpgradeToLifetime = () => {
    if (profileId) {
      changePlan({
        fromPlan: status.planType,
        toPlan: 'lifetime',
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription</CardTitle>
          {status.isPremium && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              {status.isLifetime ? 'Lifetime' : 'Premium'}
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
              <p className="font-medium capitalize">{status.planType}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{status.status || 'N/A'}</p>
            </div>
            
            {status.bookCredits > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Book Credits</p>
                <p className="font-medium">{status.bookCredits}</p>
              </div>
            )}
            
            {formattedExpirationDate && !status.isLifetime && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expires</p>
                <p className="font-medium">{formattedExpirationDate}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {showManagement && (
        <CardFooter className="flex flex-col space-y-2">
          {!status.isPremium && (
            <div className="w-full space-y-2">
              <Button 
                onClick={handleUpgradeToPro}
                disabled={isChangingPlan}
                className="w-full"
              >
                {isChangingPlan ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upgrade to Plus - ${getPlanPrice('plus')}/year
              </Button>
              <Button 
                onClick={handleUpgradeToLifetime}
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
              {status.planType === 'plus' && (
                <Button 
                  onClick={handleUpgradeToLifetime}
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
