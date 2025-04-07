
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
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/feature-showcase.png" 
          alt="Narra features showcase" 
          className="rounded-lg shadow-lg max-w-full"
        />
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
