
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionService } from '@/hooks/subscription';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [errorState, setErrorState] = useState(false);
  
  const cookieProfileId = Cookies.get('profile_id');
  const cookieEmail = Cookies.get('user_email');
  
  // Use cookie values if profileId not provided
  const effectiveProfileId = profileId || cookieProfileId;
  
  // Only pass email if we don't have a profileId
  const effectiveEmail = !effectiveProfileId ? cookieEmail : undefined;
  
  console.log(`SubscriptionStatusBadge using profileId=${effectiveProfileId}, email=${effectiveEmail}`);
  
  const { 
    status, 
    isStatusLoading, 
    statusError, 
    refetchStatus, 
    invalidateCache 
  } = useSubscriptionService(
    effectiveProfileId, 
    true, // Always force refresh to get latest data
    effectiveEmail
  );
  
  // Force refresh on mount and periodically check for updates
  useEffect(() => {
    console.log("SubscriptionStatusBadge mounted, refreshing status");
    
    const fetchData = async () => {
      try {
        // Immediately invalidate cache and refresh
        invalidateCache();
        await refetchStatus();
        setErrorState(false);
      } catch (err) {
        console.error("Error refreshing subscription status:", err);
        setErrorState(true);
        
        // Only show toast for repeated errors and not in development
        if (retryCount > 1 && process.env.NODE_ENV !== 'development') {
          toast({
            title: "Subscription Status Error",
            description: "Could not verify your subscription status. Using free tier access.",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchData();
    
    // Also set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(() => {
      console.log("Periodic subscription status refresh");
      fetchData();
      setRetryCount(prev => prev + 1);
    }, 60000); // 60 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refetchStatus, invalidateCache, retryCount, toast]);
  
  console.log("Subscription status in badge:", status);
  
  const handleUpgradeClick = () => {
    navigate('/subscribe');
  };
  
  // If there's an error, show a simplified version with an error indicator
  if (errorState && !isStatusLoading) {
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
        <AlertCircle className={cn("mr-1 text-amber-500", compact ? "h-3 w-3" : "h-4 w-4")} />
        {compact ? "Upgrade" : "Upgrade to Narra+"}
      </Button>
    );
  }
  
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
