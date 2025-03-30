
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  descriptionStyle: string;
}

interface HowItWorksSectionProps {
  howItWorksRef: React.RefObject<HTMLElement>;
  isMobile: boolean;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ 
  howItWorksRef,
  isMobile 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const howItWorksSteps: Step[] = [
    {
      id: 0,
      title: "Talk with Narra",
      description: "Call Narra and chat casually.",
      content: "Narra, an AI-powered interviewer, will ask thoughtful questions to help you tell your story in your own words.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//call-narra%20(1).jpg",
      descriptionStyle: "text-[12px]"
    },
    {
      id: 1,
      title: "Receive Your Story",
      description: "Receive your story through text.",
      content: "In about a minute, you'll be able to read your story, written in your authentic voice.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//story%20(1).jpg",
      descriptionStyle: "text-[12px]"
    },
    {
      id: 2,
      title: "Order Your Book",
      description: "Order your beautiful book.",
      content: "Once you have enough content, give your book a quick read and get a beautifully designed copy in your hands.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//book(2).jpg",
      descriptionStyle: "text-[12px]"
    }
  ];

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : howItWorksSteps.length - 1));
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev < howItWorksSteps.length - 1 ? prev + 1 : 0));
  };

  return (
    <section 
      ref={howItWorksRef as React.RefObject<HTMLElement>}
      id="how-it-works"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 md:mb-6 text-center">
          How it Works
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="w-full md:w-1/3">
            <div className="flex flex-row md:flex-col gap-2 md:gap-4 relative">
              <div className="hidden md:block absolute left-0 top-0 w-0.5 h-full bg-[rgba(47,53,70,0.13)]"></div>
              
              <div 
                className="hidden md:block absolute left-0 w-0.5 bg-[#2F3546] transition-all duration-300"
                style={{ 
                  top: `${activeStep * (100 / howItWorksSteps.length) + 9}%`,
                  height: '17px'
                }}
              ></div>
              
              {howItWorksSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`relative cursor-pointer group ${
                    isMobile ? "flex-1" : ""
                  }`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div
                    className={`relative pl-4 py-3 transition-all duration-300 md:border-l-0 ${
                      idx === activeStep
                        ? "border-l-4 border-[#242F3F] md:border-l-0"
                        : "border-l-4 border-[#C8C8C9] md:border-l-0 group-hover:border-[#555555] md:group-hover:border-l-0"
                    }`}
                  >
                    <h3
                      className={`font-uncut-sans text-sm md:text-base mb-1 transition-colors duration-300 font-normal ${
                        idx === activeStep
                          ? "text-[#242F3F]"
                          : "text-[#8A898C] group-hover:text-[#555555]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    {!isMobile && (
                      <p
                        className={`text-xs md:text-sm font-uncut-sans transition-colors duration-300 ${
                          idx === activeStep
                            ? "text-[#403E43]"
                            : "text-[#9F9EA1] group-hover:text-[#555555]"
                        }`}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:flex justify-start mt-6 space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevStep}
                className="rounded-full border-[#C8C8C9] text-[#403E43] hover:bg-[#F6F6F7] hover:text-[#242F3F]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextStep}
                className="rounded-full border-[#C8C8C9] text-[#403E43] hover:bg-[#F6F6F7] hover:text-[#242F3F]"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <Card className="bg-white rounded-[7px] shadow-md overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-caslon font-thin mb-2 text-[#242F3F]">
                    {howItWorksSteps[activeStep].description}
                  </h3>
                  <p className="text-sm md:text-base text-[#403E43]">
                    {howItWorksSteps[activeStep].content}
                  </p>
                </div>
                <div className="bg-[#F6F6F7] flex-grow">
                  <div>
                    <img
                      src={howItWorksSteps[activeStep].image}
                      alt={howItWorksSteps[activeStep].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
