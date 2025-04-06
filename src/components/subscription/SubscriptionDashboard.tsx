
import React, { useState } from 'react';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, CreditCard, FileText, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import LifetimeOfferBanner from './LifetimeOfferBanner';

interface SubscriptionDashboardProps {
  profileId?: string;
}

const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({ profileId }) => {
  const { 
    status, 
    isStatusLoading, 
    changePlan, 
    isChangingPlan, 
    getPlanPrice 
  } = useSubscriptionService(profileId);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  
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
  
  const handleCancelConfirm = () => {
    setIsConfirmingCancel(true);
  };

  const handleCancelSubscription = () => {
    if (profileId && status.planType !== 'free') {
      changePlan({
        fromPlan: status.planType,
        toPlan: 'free',
        userId: profileId
      });
      setIsConfirmingCancel(false);
    }
  };
  
  const handleCancelCancel = () => {
    setIsConfirmingCancel(false);
  };
  
  // Calculate usage percentages
  const storiesUsage = status.isPremium ? 15 : 65; // Example values
  const audioUsage = status.isPremium ? 25 : 80;   // Example values
  const bookCredits = status.bookCredits || 0;
  
  // Format expiration date if available
  const formattedExpirationDate = status.expirationDate
    ? format(status.expirationDate, 'MMM d, yyyy')
    : 'N/A';
  
  // Mock billing history data
  const billingHistory = [
    { date: '2025-03-01', amount: status.planType === 'plus' ? getPlanPrice('plus') : 0, status: 'Paid' },
    { date: '2024-02-01', amount: status.planType === 'plus' ? getPlanPrice('plus') : 0, status: 'Paid' },
  ];
  
  if (isStatusLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {!status.isLifetime && !status.isPremium && (
        <LifetimeOfferBanner profileId={profileId} />
      )}
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>Current plan and benefits</CardDescription>
                </div>
                {status.isPremium && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    {status.isLifetime ? 'Lifetime' : 'Premium'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                
                {!status.isLifetime && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {status.isPremium ? 'Renewal Date' : 'Upgrade Benefits'}
                    </p>
                    <p className="font-medium">
                      {status.isPremium ? formattedExpirationDate : 'Unlimited stories & books'}
                    </p>
                  </div>
                )}
              </div>
              
              {!status.isPremium && (
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleUpgradeToPro}
                    disabled={isChangingPlan}
                    className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
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
              
              {status.isPremium && !status.isLifetime && !isConfirmingCancel && (
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleUpgradeToLifetime}
                    disabled={isChangingPlan}
                    className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
                  >
                    Upgrade to Lifetime - ${getPlanPrice('lifetime')}
                  </Button>
                  <Button 
                    onClick={handleCancelConfirm}
                    disabled={isChangingPlan}
                    variant="outline"
                    className="w-full text-red-500 hover:text-red-600"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
              
              {isConfirmingCancel && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Confirm Cancellation</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.</p>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelCancel}
                      >
                        Keep Subscription
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleCancelSubscription}
                      >
                        Yes, Cancel
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Unlimited</div>
                {!status.isPremium && (
                  <p className="text-xs text-muted-foreground mt-1">Free tier: 10 stories</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Book Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookCredits}</div>
                {!status.isPremium && (
                  <p className="text-xs text-muted-foreground mt-1">Upgrade to get more</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Premium Voices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.isPremium ? 'Included' : 'Locked'}</div>
                {!status.isPremium && (
                  <p className="text-xs text-muted-foreground mt-1">Upgrade to access</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Monitor your resource usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stories Created</span>
                    <span className="text-sm text-muted-foreground">{storiesUsage}%</span>
                  </div>
                  <Progress value={storiesUsage} className="h-2" />
                  {!status.isPremium && storiesUsage > 50 && (
                    <p className="text-xs text-amber-600 mt-1">Approaching limit. Consider upgrading for unlimited stories.</p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Audio Minutes Used</span>
                    <span className="text-sm text-muted-foreground">{audioUsage}%</span>
                  </div>
                  <Progress value={audioUsage} className="h-2" />
                  {!status.isPremium && audioUsage > 70 && (
                    <p className="text-xs text-amber-600 mt-1">Nearing monthly limit. Upgrade for more audio time.</p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Book Credits</span>
                    <span className="text-sm text-muted-foreground">{bookCredits} remaining</span>
                  </div>
                  {status.isPremium ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Credits available for book publishing</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleUpgradeToPro} className="mt-1">
                      Get Book Credits
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Plan Comparison</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 border rounded-lg">
                    <h5 className="font-medium">Free</h5>
                    <ul className="mt-2 space-y-1">
                      <li>10 stories</li>
                      <li>Basic voices</li>
                      <li>No book publishing</li>
                    </ul>
                  </div>
                  
                  <div className="p-2 border rounded-lg bg-purple-50">
                    <h5 className="font-medium">Plus</h5>
                    <ul className="mt-2 space-y-1">
                      <li>Unlimited stories</li>
                      <li>Premium voices</li>
                      <li>Book publishing</li>
                      <li>Priority support</li>
                    </ul>
                    <div className="mt-2 font-medium">${getPlanPrice('plus')}/year</div>
                  </div>
                  
                  <div className="p-2 border rounded-lg bg-amber-50">
                    <h5 className="font-medium">Lifetime</h5>
                    <ul className="mt-2 space-y-1">
                      <li>All Plus features</li>
                      <li>Never pay again</li>
                      <li>Future updates</li>
                      <li>VIP support</li>
                    </ul>
                    <div className="mt-2 font-medium">${getPlanPrice('lifetime')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing details and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {status.planType !== 'free' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Payment Method</p>
                          <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Next Billing</p>
                      {status.isLifetime ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Lifetime plan - no future billing</span>
                        </div>
                      ) : (
                        <p className="text-sm">
                          Your next payment of ${getPlanPrice('plus')} will be on {formattedExpirationDate}
                        </p>
                      )}
                    </div>
                  </>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Billing History</p>
                  </div>
                  
                  {status.planType === 'free' ? (
                    <p className="text-sm text-muted-foreground">No billing history available - free plan</p>
                  ) : (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-3 text-xs font-medium p-2 border-b bg-muted">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      {billingHistory.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 text-xs p-2 border-b last:border-0">
                          <div>{format(new Date(item.date), 'MMM d, yyyy')}</div>
                          <div>${item.amount.toFixed(2)}</div>
                          <div className="text-green-600">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  Download Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Your subscription usage over time</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex items-center justify-center h-[200px]">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-10 w-10" />
                  <p className="text-sm">Analytics visualization will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionDashboard;
