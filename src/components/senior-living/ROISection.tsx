
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const ROISection: React.FC = () => {
  const stats = [
    { value: "40%", label: "increase in family engagement" },
    { value: "85%", label: "resident participation rate" },
    { value: "95%", label: "family satisfaction" },
    { value: "4.8/5", label: "average activity rating" }
  ];

  return (
    <section className="py-16 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-8 text-center">
        Measurable Impact:
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-[#F6F6F7] border-none shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-[#A33D29] mb-2">
                {stat.value}
              </span>
              <span className="text-[#242F3F]">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-12 bg-[#242F3F]/5 border-none p-6 rounded-lg">
        <CardContent className="p-0 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/3">
            <img 
              src="/lovable-uploads/0a16d5d3-6ff6-4ead-9443-b2b69c15a78c.png" 
              alt="Family engaging with resident stories" 
              className="rounded-lg shadow-md w-full"
            />
          </div>
          <div className="md:w-2/3 text-[#242F3F]">
            <p className="text-lg">
              Our customer satisfaction surveys consistently show that Narra's storytelling program 
              is rated as one of the most valuable resident engagement tools in senior living communities.
              Family members report deeper connections and more meaningful interactions during visits.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ROISection;
