
import React from 'react';
import { useBookPurchase } from '@/contexts/BookPurchaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onContinue: () => void;
  onCancel: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onContinue,
  onCancel
}) => {
  const { isUsingCredits, setUsingCredits, remainingCredits } = useBookPurchase();

  const hasCredits = remainingCredits > 0;
  
  // If user has no credits, automatically select the payment option
  React.useEffect(() => {
    if (!hasCredits) {
      setUsingCredits(false);
    }
  }, [hasCredits, setUsingCredits]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Payment Method</h3>
      
      {/* Credit Option */}
      <Card 
        className={`border-2 cursor-pointer transition-all ${isUsingCredits ? 'border-[#6E59A5]' : 'border-gray-200'} ${!hasCredits ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => hasCredits && setUsingCredits(true)}
      >
        <CardContent className="p-4 flex items-center">
          <div className={`p-2 rounded-full mr-3 ${isUsingCredits ? 'bg-[#6E59A5] text-white' : 'bg-gray-100'}`}>
            <Wallet size={20} />
          </div>
          <div className="flex-grow">
            <p className="font-medium">Use Book Credit</p>
            <p className="text-sm text-gray-500">
              {hasCredits 
                ? `You have ${remainingCredits} credit${remainingCredits !== 1 ? 's' : ''} available` 
                : 'No credits available'}
            </p>
          </div>
          <div className="ml-2">
            <div className={`w-5 h-5 rounded-full border-2 ${isUsingCredits ? 'border-[#6E59A5] bg-[#6E59A5]' : 'border-gray-300'}`}>
              {isUsingCredits && <div className="w-full h-full flex items-center justify-center text-white">✓</div>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Option */}
      <Card 
        className={`border-2 cursor-pointer transition-all ${!isUsingCredits ? 'border-[#6E59A5]' : 'border-gray-200'}`}
        onClick={() => setUsingCredits(false)}
      >
        <CardContent className="p-4 flex items-center">
          <div className={`p-2 rounded-full mr-3 ${!isUsingCredits ? 'bg-[#6E59A5] text-white' : 'bg-gray-100'}`}>
            <CreditCard size={20} />
          </div>
          <div className="flex-grow">
            <p className="font-medium">Credit Card</p>
            <p className="text-sm text-gray-500">Pay with Stripe secure checkout</p>
          </div>
          <div className="ml-2">
            <div className={`w-5 h-5 rounded-full border-2 ${!isUsingCredits ? 'border-[#6E59A5] bg-[#6E59A5]' : 'border-gray-300'}`}>
              {!isUsingCredits && <div className="w-full h-full flex items-center justify-center text-white">✓</div>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
