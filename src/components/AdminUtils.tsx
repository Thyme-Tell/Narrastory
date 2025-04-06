
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { logUserSubscriptionDetails } from '@/utils/subscriptionUtils';

/**
 * Admin utility component for checking user subscription status
 * This component is for administrative purposes only
 */
const AdminUtils: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  
  const handleCheckSubscription = async () => {
    if (!email) return;
    
    setIsChecking(true);
    try {
      await logUserSubscriptionDetails(email);
      console.log('Check complete - see console logs for details');
    } catch (error) {
      console.error('Error checking subscription:', error);
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
            <Input
              id="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCheckSubscription} 
          disabled={isChecking || !email}
          className="w-full"
        >
          {isChecking ? 'Checking...' : 'Check Subscription'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminUtils;
