
import React from 'react';
import { Check, DollarSign } from 'lucide-react';

interface OrderSummaryProps {
  bookTitle: string;
  bookPrice: number;
  isUsingCredits: boolean;
  remainingCredits: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  bookTitle,
  bookPrice,
  isUsingCredits,
  remainingCredits
}) => {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Order Summary</h3>
      
      <div className="border rounded-md p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="font-medium">Item</span>
          <span className="font-medium">Price</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{bookTitle}</p>
            <p className="text-sm text-gray-500">Physical book printing</p>
          </div>
          <div>
            {formatPrice(bookPrice)}
          </div>
        </div>
        
        {isUsingCredits ? (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Using 1 book credit</span>
            </div>
            <div className="font-medium text-green-600">-{formatPrice(bookPrice)}</div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-[#6E59A5] mr-1" />
              <span className="font-medium">Total payment</span>
            </div>
            <div className="font-medium">{formatPrice(bookPrice)}</div>
          </div>
        )}
      </div>
      
      {isUsingCredits && (
        <div className="text-sm text-gray-500">
          After this purchase, you will have {remainingCredits - 1} credit{remainingCredits - 1 !== 1 ? 's' : ''} remaining.
        </div>
      )}
      
      {!isUsingCredits && (
        <div className="text-sm text-gray-500">
          You will be redirected to a secure payment page to complete your purchase.
        </div>
      )}
    </div>
  );
};
