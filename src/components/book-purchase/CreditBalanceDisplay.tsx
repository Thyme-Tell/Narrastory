
import React from 'react';
import { useBookPurchase } from '@/contexts/BookPurchaseContext';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CreditBalanceDisplay: React.FC = () => {
  const { remainingCredits } = useBookPurchase();
  
  return (
    <Alert variant="default" className="bg-gray-50">
      <div className="flex items-start">
        <Info className="h-4 w-4 mt-0.5 mr-2 text-[#6E59A5]" />
        <AlertDescription>
          <span className="font-medium">Book Credit Balance:</span> {remainingCredits} {remainingCredits === 1 ? 'credit' : 'credits'} available
        </AlertDescription>
      </div>
    </Alert>
  );
};
