
import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const FeaturesSection = forwardRef<HTMLElement>((props, ref) => {
  const features = [
    "Intuitive Story Capture App",
    "AI-Powered Story Processing",
    "Beautiful Printed Keepsakes",
    "Group Activity Guides",
    "Marketing Materials",
    "Dedicated Support Team"
  ];

  return (
    <section ref={ref} className="py-16 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-8 text-center">
        Everything You Need to Succeed:
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-start">
              <div className="rounded-full bg-[#A33D29]/10 p-2 mr-4 mt-1">
                <Check className="h-5 w-5 text-[#A33D29]" />
              </div>
              <p className="text-lg text-[#242F3F]">{feature}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 flex justify-center">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-lg shadow-lg">
          <img 
            src="/lovable-uploads/89e9603b-1404-44e3-8aae-a9c186177c3c.png" 
            alt="Multi-generational storytelling experience" 
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-6 text-white">
              <p className="text-xl font-caslon">Bringing families together through shared stories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
