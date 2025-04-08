
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: "Thank you for your purchase. Your payment has been processed successfully.",
    });
  }, [toast]);
  
  const handleGoToProfile = () => {
    navigate('/profile');
  };
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border-2 border-green-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-serif">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your purchase</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your payment has been processed successfully. You can now enjoy all the premium features.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleGoToProfile}
            className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
          >
            Go to Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
