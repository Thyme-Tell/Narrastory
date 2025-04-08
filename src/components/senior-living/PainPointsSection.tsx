
import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const PainPointsSection = forwardRef<HTMLElement>((props, ref) => {
  const painPoints = [
    "Limited time to create meaningful individual engagement",
    "Need for fresh, evidence-based programming",
    "Pressure to demonstrate value to families",
    "Balancing quality activities with documentation requirements"
  ];

  return (
    <section ref={ref} className="py-16 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-8 text-center">
        We Know Your Challenges:
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {painPoints.map((point, index) => (
          <Card key={index} className="bg-white/80 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-[#A33D29]/10 text-[#A33D29] font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                  {index + 1}
                </div>
                <p className="text-lg text-[#242F3F]">{point}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});

PainPointsSection.displayName = "PainPointsSection";

export default PainPointsSection;
