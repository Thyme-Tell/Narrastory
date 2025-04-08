
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redirect to profile after 5 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      if (user?.id) {
        navigate(`/profile/${user.id}`);
      } else {
        navigate('/');
      }
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to Narra+. Your subscription has been activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You now have access to all premium features. Start creating beautiful stories with enhanced tools and features.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be redirected to your profile automatically in a few seconds.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate(user?.id ? `/profile/${user.id}` : '/')}
          >
            Go to My Profile
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/subscription')}
          >
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
