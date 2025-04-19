import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Clock, Users, FileText, CheckCircle2 } from "lucide-react";

interface ProgramBenefitsProps {
  ref?: React.Ref<HTMLElement>;
}

const ProgramBenefits = forwardRef<HTMLElement, ProgramBenefitsProps>((props, ref) => {
  const benefits = [
    {
      icon: Book,
      title: "Professional Story Capture",
      description: "Expert guidance in capturing and organizing your life stories"
    },
    {
      icon: Clock,
      title: "Guided Process",
      description: "Step-by-step approach to writing your memoir"
    },
    {
      icon: Users,
      title: "Family Collaboration",
      description: "Easy sharing and collaboration with family members"
    },
    {
      icon: FileText,
      title: "Digital Preservation",
      description: "Secure, cloud-based storage of your stories"
    },
    {
      icon: CheckCircle2,
      title: "Physical Book Option",
      description: "Beautifully designed hardcover book of your stories"
    }
  ];

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#262626]">
            Program Benefits
          </h2>
          <p className="text-xl text-[#2F3546] max-w-3xl mx-auto">
            The Write Your Life program combines professional guidance with innovative technology to make preserving your stories simple and meaningful.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <benefit.icon className="h-8 w-8 text-[#A33D29]" />
                <h3 className="text-xl font-caslon font-thin text-[#262626]">
                  {benefit.title}
                </h3>
                <p className="text-[#2F3546]">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6">
          <h3 className="text-2xl font-caslon font-thin text-[#262626]">
            Process Overview
          </h3>
          <div className="max-w-4xl mx-auto">
            <ol className="list-decimal list-inside space-y-4 text-left text-[#2F3546]">
              <li>Initial consultation with our story experts</li>
              <li>Guided story capture sessions</li>
              <li>Digital organization and editing</li>
              <li>Family review and collaboration</li>
              <li>Final book production and delivery</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
});

ProgramBenefits.displayName = "ProgramBenefits";

export default ProgramBenefits; 