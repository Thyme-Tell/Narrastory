
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentCanceledPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/subscribe');
  };
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border-2 border-gray-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-gray-400" />
          </div>
          <CardTitle className="text-2xl font-serif">Payment Canceled</CardTitle>
          <CardDescription>Your payment was not completed</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            The payment process was canceled. No charges have been made to your account.
          </p>
          <p className="text-sm text-gray-500">
            If you experienced any issues or have questions, please contact our support team.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleGoBack}
            className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCanceledPage;
