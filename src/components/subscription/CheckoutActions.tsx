
import React from 'react';
import { Button } from '@/components/ui/button';

interface CheckoutActionsProps {
  isLoading: boolean;
  onContinue: () => void;
}

const CheckoutActions: React.FC<CheckoutActionsProps> = ({
  isLoading,
  onContinue,
}) => {
  return (
    <div className="mt-8 flex flex-col md:flex-row md:justify-between gap-4">
      <div className="text-sm text-gray-500">
        <p>All plans include a 30-day money-back guarantee.</p>
        <p>By continuing, you agree to our Terms and Conditions.</p>
      </div>
      <Button 
        size="lg" 
        className="bg-[#6E59A5] hover:bg-[#5d4a8a]"
        onClick={onContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="mr-2">
              <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
            </span>
            Processing...
          </>
        ) : (
          <>Continue to Checkout</>
        )}
      </Button>
    </div>
  );
};

export default CheckoutActions;
