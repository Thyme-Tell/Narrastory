
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { Card, CardContent } from "@/components/ui/card";

interface UpgradePromptProps {
  profileId?: string;
  variant?: 'banner' | 'card' | 'floating';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  profileId,
  variant = 'banner'
}) => {
  const { getPlanPrice } = useSubscriptionService(profileId);
  const plusPrice = getPlanPrice('plus');
  
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-[280px] shadow-lg rounded-lg overflow-hidden bg-white/95 border border-purple-100 animate-fade-in">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#9b87f5]" />
            <h3 className="font-serif text-sm font-bold">Unlock Premium Features</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">Create unlimited stories and publish beautiful family books</p>
          <Button 
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white text-xs"
            size="sm"
            asChild
          >
            <Link to={profileId ? `/subscribe/${profileId}` : "/subscribe"}>
              Upgrade Now
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (variant === 'card') {
    return (
      <Card className="overflow-hidden border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#9b87f5]" />
            <h3 className="font-serif text-sm font-bold">Upgrade Your Experience</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">Get unlimited stories, premium voices, and beautiful book publishing</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Starting at ${plusPrice}/year</span>
            <Button 
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white text-xs"
              size="sm"
              asChild
            >
              <Link to={profileId ? `/subscribe/${profileId}` : "/subscribe"}>
                Upgrade
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default banner style
  return (
    <div className="w-full rounded-lg overflow-hidden p-3" 
      style={{
        background: 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white" />
          <p className="text-white text-sm">Unlock unlimited stories, premium voices, and book publishing</p>
        </div>
        <Button 
          className="bg-white text-[#7E69AB] hover:bg-white/90 text-xs md:text-sm whitespace-nowrap"
          size="sm"
          asChild
        >
          <Link to={profileId ? `/subscribe/${profileId}` : "/subscribe"}>
            Upgrade Now
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default UpgradePrompt;
