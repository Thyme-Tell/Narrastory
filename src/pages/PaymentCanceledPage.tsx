
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const PaymentCanceledPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-700">Payment Canceled</CardTitle>
          <CardDescription>
            Your subscription payment was not completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            No worries! You can try again whenever you're ready. If you experienced any issues during checkout, please contact our support team.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/subscribe')}
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(user?.id ? `/profile/${user.id}` : '/')}
          >
            Back to Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCanceledPage;
