
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPurchaseProvider, useBookPurchase } from '@/contexts/BookPurchaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CreditBalanceDisplay } from './CreditBalanceDisplay';
import { OrderSummary } from './OrderSummary';

interface BookPurchaseFlowProps {
  profileId: string;
  bookId?: string;
  bookTitle: string;
  bookPrice: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const BookPurchaseFlow: React.FC<BookPurchaseFlowProps> = ({
  profileId,
  bookId,
  bookTitle,
  bookPrice,
  onComplete,
  onCancel
}) => {
  return (
    <BookPurchaseProvider
      profileId={profileId}
      bookId={bookId}
      bookTitle={bookTitle}
      bookPrice={bookPrice}
    >
      <BookPurchaseContent onComplete={onComplete} onCancel={onCancel} />
    </BookPurchaseProvider>
  );
};

const BookPurchaseContent: React.FC<{ onComplete?: () => void; onCancel?: () => void }> = ({ 
  onComplete, 
  onCancel 
}) => {
  const [step, setStep] = useState<'method' | 'confirm' | 'processing' | 'success'>('method');
  const navigate = useNavigate();
  
  const {
    bookTitle,
    bookPrice,
    isUsingCredits,
    remainingCredits,
    isPurchasing,
    startPurchase
  } = useBookPurchase();

  const handlePurchase = async () => {
    setStep('processing');
    const success = await startPurchase();
    
    if (success) {
      setStep('success');
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } else {
      // Go back to method selection if there was an error
      setStep('method');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Purchase Book</CardTitle>
        <CardDescription>
          {step === 'method' && "Select your payment method"}
          {step === 'confirm' && "Review your order"}
          {step === 'processing' && "Processing your purchase..."}
          {step === 'success' && "Purchase Successful!"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Credit Balance Display */}
        <CreditBalanceDisplay />
        
        {/* Step 1: Payment Method Selection */}
        {step === 'method' && (
          <PaymentMethodSelector 
            onContinue={() => setStep('confirm')}
            onCancel={handleCancel}
          />
        )}
        
        {/* Step 2: Order Confirmation */}
        {step === 'confirm' && (
          <OrderSummary 
            bookTitle={bookTitle}
            bookPrice={bookPrice}
            isUsingCredits={isUsingCredits}
            remainingCredits={remainingCredits}
          />
        )}
        
        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E59A5]"></div>
            <span className="ml-3">Processing your purchase...</span>
          </div>
        )}
        
        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium">Purchase Successful!</h3>
            <p className="text-gray-500 mt-2">Your book is now available.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step === 'confirm' && (
          <>
            <Button variant="outline" onClick={() => setStep('method')}>
              Back
            </Button>
            <Button 
              className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? 'Processing...' : isUsingCredits ? 'Use Credit' : 'Proceed to Payment'}
            </Button>
          </>
        )}
        
        {step === 'success' && (
          <Button 
            className="bg-[#6E59A5] hover:bg-[#5d4a8a] w-full" 
            onClick={onComplete || (() => navigate(-1))}
          >
            Done
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
