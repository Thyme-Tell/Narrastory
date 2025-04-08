
import React from 'react';
import { Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  isLoading: boolean;
}

const PromoCodeSection: React.FC<PromoCodeSectionProps> = ({
  promoCode,
  setPromoCode,
  isLoading,
}) => {
  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 mr-2 text-[#6E59A5]" />
        <h3 className="font-medium">Promo Code</h3>
      </div>
      <div className="flex gap-2">
        <Input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          className="max-w-xs"
          disabled={isLoading}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        If you have a promotional code, enter it above to receive your discount.
      </p>
    </div>
  );
};

export default PromoCodeSection;
