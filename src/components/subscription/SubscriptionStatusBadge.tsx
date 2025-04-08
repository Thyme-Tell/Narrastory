
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { cn } from '@/lib/utils';

interface SubscriptionStatusBadgeProps {
  profileId?: string;
  compact?: boolean;
  className?: string;
}

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ 
  profileId, 
  compact = true,
  className
}) => {
  const navigate = useNavigate();
  const { status, isStatusLoading } = useSubscriptionService(profileId);
  
  const handleUpgradeClick = () => {
    navigate('/subscribe');
  };
  
  if (isStatusLoading) {
    return (
      <div className={cn("flex items-center justify-center h-9", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (status.isPremium) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 px-2 py-1",
          compact ? "text-xs" : "text-sm px-3 py-1.5",
          className
        )}
      >
        <Sparkles className={cn("text-amber-600", compact ? "h-3 w-3" : "h-4 w-4")} />
        {status.isLifetime ? "Narra+ Lifetime" : "Narra+"}
      </Badge>
    );
  }
  
  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleUpgradeClick}
      className={cn(
        "text-purple-700 border-purple-300 hover:bg-purple-50 hover:text-purple-800",
        compact ? "text-xs px-2 py-1 h-7" : "",
        className
      )}
    >
      <Sparkles className={cn("mr-1 text-purple-500", compact ? "h-3 w-3" : "h-4 w-4")} />
      {compact ? "Upgrade" : "Upgrade to Narra+"}
    </Button>
  );
};

export default SubscriptionStatusBadge;
