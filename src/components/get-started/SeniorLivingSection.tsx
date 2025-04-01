
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SeniorLivingDialog from "./SeniorLivingDialog";

interface SeniorLivingSectionProps {
  seniorLivingRef: React.RefObject<HTMLElement>;
  isMobile: boolean;
}

const SeniorLivingSection: React.FC<SeniorLivingSectionProps> = ({ 
  seniorLivingRef,
  isMobile 
}) => {
  const [isSeniorLivingDialogOpen, setSeniorLivingDialogOpen] = useState(false);
  
  return (
    <section 
      ref={seniorLivingRef as React.RefObject<HTMLElement>}
      id="senior-living"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 md:mb-10 text-center">
          For Senior Living Communities
        </h2>
        
        <Card className="bg-[#F6F6F7] rounded-[7px] shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F]">
              You care deeply about your residents and their stories.
            </h3>
            
            <p className="text-sm md:text-base text-[#403E43] mb-6">
              Enable your residents to write their memoirs without the hurdles of using technology. With Narra, their voice is all they need.
            </p>
            
            <ul className="space-y-3 text-sm md:text-base text-[#403E43] mb-6">
              <li className="flex items-start">
                <span className="rounded-full bg-[#A33D29]/10 p-1 mr-3 mt-0.5">
                  <ArrowRight className="h-3 w-3 text-[#A33D29]" />
                </span>
                <span>A meaningful activity that deepens relationships between the community and family members</span>
              </li>
              <li className="flex items-start">
                <span className="rounded-full bg-[#A33D29]/10 p-1 mr-3 mt-0.5">
                  <ArrowRight className="h-3 w-3 text-[#A33D29]" />
                </span>
                <span>No technology barriers or complicated interfaces</span>
              </li>
              <li className="flex items-start">
                <span className="rounded-full bg-[#A33D29]/10 p-1 mr-3 mt-0.5">
                  <ArrowRight className="h-3 w-3 text-[#A33D29]" />
                </span>
                <span>Residents can tell their life stories with just their voice</span>
              </li>
            </ul>
            
            <div className="flex justify-center md:justify-start">
              <Button
                onClick={() => setSeniorLivingDialogOpen(true)}
                className="rounded-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
              >
                Schedule a Workshop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Senior Living Dialog */}
      <SeniorLivingDialog 
        open={isSeniorLivingDialogOpen} 
        onOpenChange={setSeniorLivingDialogOpen} 
      />
    </section>
  );
};

export default SeniorLivingSection;
