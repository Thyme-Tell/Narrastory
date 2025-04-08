
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const RiskReversalSection: React.FC = () => {
  const benefits = [
    "30-day free trial",
    "Full feature access",
    "Dedicated onboarding specialist",
    "No credit card required"
  ];

  return (
    <section className="py-16 max-w-6xl mx-auto">
      <Card className="bg-[#F6F6F7] border-none shadow-lg overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
              <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6">
                Try Narra Risk-Free:
              </h2>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="rounded-full bg-[#A33D29] p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg text-[#242F3F]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/32990903-8174-4653-a856-722de90c1d06.png" 
                alt="Senior residents enjoying the Narra experience" 
                className="rounded-lg shadow-md w-full h-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RiskReversalSection;
