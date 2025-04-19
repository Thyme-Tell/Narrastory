import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FoundersHeroProps {
  heroRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
}

const FoundersHero: React.FC<FoundersHeroProps> = ({ heroRef, isMobile }) => {
  const navigate = useNavigate();

  const handlePurchaseClick = () => {
    // TODO: Implement Stripe checkout
    console.log("Initiating purchase...");
  };

  return (
    <div 
      ref={heroRef}
      className="w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12 md:py-24"
    >
      <div className="w-full md:w-1/2 space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-caslon font-thin leading-tight text-[#262626]">
          Making Memory Preservation Easy for All Ages
        </h1>
        
        <p className="text-xl md:text-2xl text-[#2F3546]">
          Meet Richard Squires and Mia Peroff, the founders of Narra, who combined their expertise in memoir writing and technology to create a revolutionary way to preserve family stories.
        </p>
        
        <div className="pt-6">
          <Button 
            onClick={handlePurchaseClick}
            className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white text-lg px-8 py-6 rounded-full"
          >
            Join Write Your Life Program - $499
          </Button>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/founders-image.jpg" 
          alt="Narra Founders Richard Squires and Mia Peroff" 
          className="w-full h-auto rounded-lg shadow-xl"
        />
      </div>
    </div>
  );
};

export default FoundersHero; 