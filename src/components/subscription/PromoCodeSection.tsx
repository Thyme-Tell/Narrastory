
import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  isLoading: boolean;
  onApplyPromoCode: (code: string) => Promise<boolean>;
}

const PromoCodeSection: React.FC<PromoCodeSectionProps> = ({
  promoCode,
  setPromoCode,
  isLoading,
  onApplyPromoCode,
}) => {
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    try {
      const isValid = await onApplyPromoCode(promoCode);
      
      if (isValid) {
        setIsApplied(true);
        toast({
          title: "Success",
          description: `Promo code "${promoCode}" applied successfully!`,
        });
      } else {
        setIsApplied(false);
        toast({
          title: "Invalid Code",
          description: "The promo code you entered is invalid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "Error",
        description: "There was an error applying the promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const resetPromoCode = () => {
    setPromoCode('');
    setIsApplied(false);
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 mr-2 text-[#6E59A5]" />
        <h3 className="font-medium">Promo Code</h3>
      </div>
      <div className="flex gap-2">
        <Input
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            if (isApplied) setIsApplied(false);
          }}
          placeholder="Enter promo code"
          className="max-w-xs"
          disabled={isLoading || isApplying || isApplied}
        />
        {isApplied ? (
          <Button 
            variant="outline" 
            onClick={resetPromoCode} 
            disabled={isLoading}
          >
            Change
          </Button>
        ) : (
          <Button 
            onClick={handleApplyPromoCode} 
            disabled={isLoading || isApplying || !promoCode.trim()}
          >
            {isApplying ? (
              <>
                <span className="mr-2">
                  <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
                </span>
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {isApplied ? (
          <span className="text-green-600 font-medium">
            Promo code applied! Your discount will be applied at checkout.
          </span>
        ) : (
          "If you have a promotional code, enter it above to receive your discount."
        )}
      </p>
    </div>
  );
};

export default PromoCodeSection;
