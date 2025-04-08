
import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  interval: string;
  features: string[];
  isSelected: boolean;
  isBestValue?: boolean;
  onSelect: () => void;
  footnote?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  price,
  interval,
  features,
  isSelected,
  isBestValue = false,
  onSelect,
  footnote,
}) => {
  return (
    <Card 
      className={`border-2 ${isSelected ? 'border-[#6E59A5]' : 'border-gray-200'} transition-all hover:shadow-md relative overflow-hidden`}
    >
      {isBestValue && (
        <div className="absolute top-0 right-0 bg-[#6E59A5] text-white px-3 py-1 text-xs font-semibold">
          BEST VALUE
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-serif">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant={isSelected ? 'default' : 'outline'} 
            size="sm"
            className={isSelected ? 'bg-[#6E59A5] hover:bg-[#5d4a8a]' : ''}
            onClick={onSelect}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-2xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1">{interval}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        {footnote && (
          <p className="text-xs text-gray-500 mt-4">
            {footnote}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCard;
