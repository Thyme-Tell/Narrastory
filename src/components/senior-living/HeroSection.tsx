
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroRef, isMobile }) => {
  const handleBookDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={heroRef}
      className="w-full min-h-[80vh] flex flex-col justify-center items-center py-16 md:py-24"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-caslon font-thin mb-6 leading-tight text-[#242F3F] fade-in-element"
          style={{ letterSpacing: "-0.02em" }}
        >
          Transform Resident Stories into Lasting Family Treasures
        </h1>
        
        <h2 className="text-xl md:text-2xl font-caslon mb-8 text-[#242F3F] max-w-3xl mx-auto fade-in-element delay-200">
          Empower your activity programming with AI-powered storytelling that residents and families love
        </h2>
        
        <div className="mt-8 fade-in-element delay-300">
          <Button 
            onClick={handleBookDemo}
            className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white rounded-full px-8 py-6 text-lg"
          >
            Book Your Free Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EFF1E9] z-10"></div>
          <img 
            src="/lovable-uploads/89e9603b-1404-44e3-8aae-a9c186177c3c.png" 
            alt="Senior residents sharing stories with family" 
            className="max-w-full rounded-lg shadow-lg relative z-0"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
