
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { logUserSubscriptionDetails, checkSubscriptionByEmail } from '@/utils/subscriptionUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * Admin utility component for checking user subscription status
 * This component is for administrative purposes only
 */
const AdminUtils: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  
  const handleCheckSubscription = async () => {
    if (!email) return;
    
    setIsChecking(true);
    setCheckResult(null);
    
    try {
      // Check if user exists and get subscription details
      const subscriptionDetails = await checkSubscriptionByEmail(email);
      
      // Log full details to console for debugging
      await logUserSubscriptionDetails(email);
      
      if (subscriptionDetails) {
        setCheckResult({
          success: true,
          message: `User found with ${subscriptionDetails.isPremium ? 'Premium' : 'Free'} plan (${subscriptionDetails.bookCredits} credits)`
        });
        
        toast({
          title: "Subscription check complete",
          description: "See console for full details",
        });
      } else {
        setCheckResult({
          success: false,
          message: `No user found with email: ${email}`
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setCheckResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        variant: "destructive",
        title: "Error checking subscription",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Utilities</CardTitle>
        <CardDescription>Check user subscription status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          {checkResult && (
            <Alert variant={checkResult.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {checkResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <AlertDescription>{checkResult.message}</AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCheckSubscription} 
          disabled={isChecking || !email}
          className="w-full"
        >
          {isChecking ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Checking...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Check Subscription
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminUtils;
