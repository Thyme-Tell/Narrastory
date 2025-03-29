
import React from "react";
import CardSwiper, { SwipeableCard } from "@/components/ui/card-swiper";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CardSwiperDemo = () => {
  // Example cards data
  const cards: SwipeableCard[] = [
    {
      id: 1,
      content: (
        <>
          <CardHeader>
            <CardTitle className="text-xl">Card One</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the first card. Swipe right or left to see more cards.</p>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full">Action</Button>
          </CardFooter>
        </>
      ),
    },
    {
      id: 2,
      content: (
        <>
          <CardHeader>
            <CardTitle className="text-xl">Card Two</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the second card with different content.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Learn More</Button>
          </CardFooter>
        </>
      ),
    },
    {
      id: 3,
      content: (
        <>
          <CardHeader>
            <CardTitle className="text-xl">Card Three</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Here's the third card. Try swiping in both directions.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">Explore</Button>
          </CardFooter>
        </>
      ),
    },
  ];

  // Handle swipe events
  const handleSwipe = (direction: 'left' | 'right', cardId: string | number) => {
    toast(`Swiped ${direction} on card ${cardId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 h-[350px] px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Card Swiper Demo</h2>
      <CardSwiper 
        cards={cards}
        onSwipe={handleSwipe}
        showNavigationButtons={true}
        className="h-[300px]"
      />
    </div>
  );
};

export default CardSwiperDemo;
