
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BookPurchaseFlowProps {
  profileId: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const BookPurchaseFlow: React.FC<BookPurchaseFlowProps> = (props) => {
  const [isPurchaseInProgress, setIsPurchaseInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  const handlePurchase = async () => {
    setIsPurchaseInProgress(true);
    
    try {
      // Placeholder for future implementation
      console.log('Book purchase functionality to be implemented');
      
      if (props.onComplete) {
        props.onComplete();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('There was an error processing your purchase. Please try again later.');
    } finally {
      setIsPurchaseInProgress(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Book</CardTitle>
          <CardDescription>
            Complete your purchase of "{props.bookTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Item</span>
                <span className="font-medium">Price</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{props.bookTitle}</p>
                  <p className="text-sm text-gray-500">Physical book printing</p>
                </div>
                <div>
                  ${props.bookPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            {purchaseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{purchaseError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              {props.onCancel && (
                <Button
                  variant="outline"
                  onClick={props.onCancel}
                  disabled={isPurchaseInProgress}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handlePurchase}
                disabled={isPurchaseInProgress}
              >
                {isPurchaseInProgress ? "Processing..." : "Place Order"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
