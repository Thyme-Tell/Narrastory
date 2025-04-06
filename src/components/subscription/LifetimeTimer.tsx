
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LifetimeTimerProps {
  expiryTimestamp: Date;
  onExpire?: () => void;
  compact?: boolean;
}

const LifetimeTimer: React.FC<LifetimeTimerProps> = ({ 
  expiryTimestamp, 
  onExpire,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft() {
    const difference = expiryTimestamp.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
      
      // Check if the timer has expired
      if (updatedTimeLeft.hours === 0 && 
          updatedTimeLeft.minutes === 0 && 
          updatedTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [expiryTimestamp, onExpire]);

  // Format time units to always show two digits
  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <div className="text-white/90 text-xs">
        Offer expired
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${compact ? 'gap-1' : 'gap-2'}`}>
      <span className="text-white/90 text-xs">
        <Clock className="inline mr-1 h-3 w-3" /> Offer ends in:
      </span>
      <div className="flex items-center">
        <div className={`flex items-center ${compact ? 'text-xs' : 'text-sm'} font-medium text-white`}>
          <span className="tabular-nums">{formatTimeUnit(timeLeft.hours)}</span>
          <span className="mx-0.5">:</span>
          <span className="tabular-nums">{formatTimeUnit(timeLeft.minutes)}</span>
          <span className="mx-0.5">:</span>
          <span className="tabular-nums">{formatTimeUnit(timeLeft.seconds)}</span>
        </div>
      </div>
    </div>
  );
};

export default LifetimeTimer;
