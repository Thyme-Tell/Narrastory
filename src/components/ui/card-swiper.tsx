
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SwipeableCard {
  id: string | number;
  content: React.ReactNode;
}

interface CardSwiperProps {
  cards: SwipeableCard[];
  onSwipe?: (direction: 'left' | 'right', cardId: string | number) => void;
  className?: string;
  cardClassName?: string;
  showNavigationButtons?: boolean;
}

const CardSwiper: React.FC<CardSwiperProps> = ({
  cards,
  onSwipe,
  className,
  cardClassName,
  showNavigationButtons = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger a swipe action (in px)
  const minSwipeDistance = 50;

  // Calculate indices for prev, current, and next cards with circular wrapping
  const getCardIndices = () => {
    const totalCards = cards.length;
    if (totalCards === 0) return { prev: -1, current: -1, next: -1 };
    if (totalCards === 1) return { prev: 0, current: 0, next: 0 };
    
    return {
      prev: (currentIndex - 1 + totalCards) % totalCards,
      current: currentIndex,
      next: (currentIndex + 1) % totalCards,
    };
  };

  const { prev, current, next } = getCardIndices();

  // Handle swipe to previous card
  const handlePrevCard = () => {
    if (cards.length <= 1) return;
    
    const newIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(newIndex);
    onSwipe?.('left', cards[newIndex].id);
  };

  // Handle swipe to next card
  const handleNextCard = () => {
    if (cards.length <= 1) return;
    
    const newIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(newIndex);
    onSwipe?.('right', cards[newIndex].id);
  };

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    
    // Limit swipe distance for better UX
    const maxSwipeOffset = containerRef.current?.offsetWidth || 300;
    const limitedOffset = Math.max(Math.min(diff, maxSwipeOffset / 2), -maxSwipeOffset / 2);
    
    setSwipeOffset(limitedOffset);
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    setSwipeOffset(0);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextCard();
    } else if (isRightSwipe) {
      handlePrevCard();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse event handlers (similar to touch but for desktop)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsSwiping(true);
    
    // Prevent text selection during dragging
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const diff = startX - e.clientX;
    
    // Limit swipe distance
    const maxSwipeOffset = containerRef.current?.offsetWidth || 300;
    const limitedOffset = Math.max(Math.min(diff, maxSwipeOffset / 2), -maxSwipeOffset / 2);
    
    setSwipeOffset(limitedOffset);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsSwiping(false);
    setSwipeOffset(0);
    
    const diff = startX - e.clientX;
    const isLeftSwipe = diff > minSwipeDistance;
    const isRightSwipe = diff < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextCard();
    } else if (isRightSwipe) {
      handlePrevCard();
    }
    
    setIsDragging(false);
  };

  // Ensure we stop dragging if mouse leaves the component
  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsSwiping(false);
      setSwipeOffset(0);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, cards.length]);

  // Empty state handling
  if (cards.length === 0) {
    return (
      <div className={cn("w-full flex justify-center items-center p-8", className)}>
        <Card className="w-full max-w-md h-64 flex items-center justify-center text-muted-foreground">
          No cards available
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative w-full overflow-hidden", className)}
      ref={containerRef}
    >
      <div 
        className="flex justify-center items-center relative h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Previous Card */}
        {cards.length > 1 && prev !== -1 && (
          <Card 
            className={cn(
              "absolute left-0 transform -translate-x-[85%] scale-95 opacity-70 transition-transform duration-300 shadow-md cursor-pointer select-none",
              cardClassName
            )}
          >
            {cards[prev].content}
          </Card>
        )}

        {/* Current Card */}
        <Card 
          className={cn(
            "relative z-10 w-full max-w-md transition-transform duration-300 shadow-lg cursor-grab active:cursor-grabbing select-none",
            isSwiping && "transition-none",
            cardClassName
          )}
          style={{
            transform: isSwiping ? `translateX(${-swipeOffset}px)` : 'translateX(0)',
          }}
        >
          {cards[current].content}
        </Card>

        {/* Next Card */}
        {cards.length > 1 && next !== -1 && (
          <Card 
            className={cn(
              "absolute right-0 transform translate-x-[85%] scale-95 opacity-70 transition-transform duration-300 shadow-md cursor-pointer select-none",
              cardClassName
            )}
          >
            {cards[next].content}
          </Card>
        )}
      </div>

      {/* Navigation buttons */}
      {showNavigationButtons && cards.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
            onClick={handlePrevCard}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
            onClick={handleNextCard}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardSwiper;
