
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { BookPurchaseProvider, useBookPurchase } from '@/contexts/BookPurchaseContext';
import { CreditBalanceDisplay } from './CreditBalanceDisplay';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { OrderSummary } from './OrderSummary';

interface BookPurchaseFlowProps {
  profileId: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

// Wrapper component that provides the context
export const BookPurchaseFlow: React.FC<BookPurchaseFlowProps> = (props) => {
  return (
    <BookPurchaseProvider 
      profileId={props.profileId}
      bookId={props.bookId}
      bookPrice={props.bookPrice}
      onComplete={props.onComplete}
      onCancel={props.onCancel}
    >
      <BookPurchaseFlowContent 
        bookTitle={props.bookTitle}
        bookPrice={props.bookPrice}
      />
    </BookPurchaseProvider>
  );
};

// Inner component that consumes the context
const BookPurchaseFlowContent: React.FC<{
  bookTitle: string;
  bookPrice: number;
}> = ({ bookTitle, bookPrice }) => {
  const {
    isUsingCredits, 
    remainingCredits,
    togglePaymentMethod,
    completePurchase,
    isPurchaseInProgress,
    purchaseError
  } = useBookPurchase();
  
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handlePurchase = async () => {
    await completePurchase();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Book</CardTitle>
          <CardDescription>
            Complete your purchase of "{bookTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Show credit balance */}
            <CreditBalanceDisplay />
            
            {/* Payment options */}
            <PaymentMethodSelector 
              canUseCredits={remainingCredits > 0}
              isUsingCredits={isUsingCredits}
              onToggle={togglePaymentMethod}
            />
            
            {/* Order summary */}
            <OrderSummary 
              bookTitle={bookTitle}
              bookPrice={bookPrice}
              isUsingCredits={isUsingCredits}
              remainingCredits={remainingCredits}
            />
            
            {/* Error display */}
            {purchaseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{purchaseError}</AlertDescription>
              </Alert>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              {isConfirming ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirming(false)}
                    disabled={isPurchaseInProgress}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchaseInProgress}
                  >
                    {isPurchaseInProgress ? "Processing..." : "Confirm Purchase"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsConfirming(true)}
                  className="ml-auto"
                >
                  Continue to Checkout <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
