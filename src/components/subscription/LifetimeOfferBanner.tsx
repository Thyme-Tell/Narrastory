
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import LifetimeTimer from './LifetimeTimer';

interface LifetimeOfferBannerProps {
  profileId?: string;
  showTimer?: boolean;
  compact?: boolean;
}

const LifetimeOfferBanner: React.FC<LifetimeOfferBannerProps> = ({ 
  profileId,
  showTimer = true,
  compact = false
}) => {
  const { getPlanPrice } = useSubscriptionService(profileId);
  const lifetimePrice = getPlanPrice('lifetime');
  
  return (
    <div className={`w-full rounded-lg overflow-hidden ${compact ? 'py-3 px-4' : 'p-5 md:p-6'}`} 
      style={{
        background: 'linear-gradient(135deg, #6E59A5 0%, #9b87f5 100%)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
              <Clock className="mr-1 h-3 w-3" />
              Limited Time Offer
            </span>
          </div>
          
          <h3 className={`font-serif text-white ${compact ? 'text-lg' : 'text-xl md:text-2xl'} font-bold`}>
            Lifetime Access for ${lifetimePrice}
          </h3>
          
          {!compact && (
            <p className="text-white/90 text-sm md:text-base max-w-md">
              One-time payment, unlimited access forever. No recurring fees, ever.
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {showTimer && (
            <div className="text-center">
              <LifetimeTimer 
                expiryTimestamp={new Date(Date.now() + 24 * 60 * 60 * 1000)} 
                compact={compact}
              />
            </div>
          )}
          
          <Button 
            className="bg-white text-[#6E59A5] hover:bg-white/90 hover:text-[#5d4a8a] w-full md:w-auto"
            size={compact ? "sm" : "default"}
            asChild
          >
            <Link to={profileId ? `/subscribe/${profileId}` : "/subscribe"}>
              Get Lifetime Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LifetimeOfferBanner;
