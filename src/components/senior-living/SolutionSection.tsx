
import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SolutionSection = forwardRef<HTMLElement>((props, ref) => {
  const solutions = [
    "Transform casual conversations into beautiful keepsakes",
    "Create engaging group activities that preserve memories",
    "Strengthen family connections through shared stories",
    "Add value to existing programs without adding complexity"
  ];

  return (
    <section ref={ref} className="py-16 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-4 text-center">
        Introducing Narra: Your All-in-One Storytelling Solution
      </h2>
      
      <Card className="bg-[#F6F6F7] border-none shadow-lg p-2 mt-8">
        <CardContent className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <div key={index} className="flex items-start">
                <div className="rounded-full bg-[#A33D29]/10 p-1 mr-3 mt-0.5">
                  <Check className="h-5 w-5 text-[#A33D29]" />
                </div>
                <p className="text-lg text-[#242F3F]">{solution}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/conversation-to-book.png" 
              alt="From conversation to memory book" 
              className="rounded-lg shadow-md max-w-full md:max-w-2xl"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

SolutionSection.displayName = "SolutionSection";

export default SolutionSection;
