
import React, { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Users, Heart } from "lucide-react";

const BenefitsSection = forwardRef<HTMLElement>((props, ref) => {
  const benefits = [
    {
      title: "Boost Resident Engagement",
      icon: <Users className="h-8 w-8 text-[#A33D29]" />,
      items: [
        "AI-powered conversation guides",
        "Easy-to-implement group activities",
        "Personalized memory prompts"
      ],
      image: "/lovable-uploads/32990903-8174-4653-a856-722de90c1d06.png"
    },
    {
      title: "Save Time & Effort",
      icon: <Clock className="h-8 w-8 text-[#A33D29]" />,
      items: [
        "Simple 15-minute onboarding",
        "Integrates with existing programs",
        "Done-for-you activity materials"
      ],
      image: "/lovable-uploads/70c3a5dd-a4eb-4759-8aa7-3b26e3b3a147.png"
    },
    {
      title: "Delight Families",
      icon: <Heart className="h-8 w-8 text-[#A33D29]" />,
      items: [
        "Professional-quality memory books",
        "Digital story sharing",
        "Cross-generational connection opportunities"
      ],
      image: "/lovable-uploads/0a16d5d3-6ff6-4ead-9443-b2b69c15a78c.png"
    }
  ];

  return (
    <section ref={ref} className="py-16 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-4 text-center">
        Why Activity Directors Choose Narra:
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {benefits.map((benefit, index) => (
          <Card key={index} className="bg-white border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                {benefit.icon}
              </div>
              <CardTitle className="text-xl text-center font-caslon text-[#242F3F]">
                {benefit.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="rounded-full bg-[#A33D29]/10 p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4 text-[#A33D29]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <img 
                  src={benefit.image} 
                  alt={benefit.title} 
                  className="rounded-md h-48 w-full object-cover shadow-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});

BenefitsSection.displayName = "BenefitsSection";

export default BenefitsSection;
