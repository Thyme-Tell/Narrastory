
import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface SeniorLivingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SeniorLivingDialog: React.FC<SeniorLivingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-caslon font-thin text-[#242F3F] mb-2">
            Narra: Preserving Family Memories for Generations
          </DialogTitle>
          <DialogDescription className="text-[#403E43]">
            You care about your residents and their stories. 
            Our storytelling platform empowers senior communities to celebrate each resident's narrative, making it easy and accessible without the hurdles of technology.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#242F3F] mb-3">Features & Benefits:</h3>
            <ul className="space-y-3 text-[#403E43]">
              <li className="flex items-start">
                <div className="bg-[#F8E3C8] rounded-full p-1 mr-2 mt-0.5">
                  <div className="w-2 h-2 bg-[#674019] rounded-full"></div>
                </div>
                <span><span className="font-medium">AI Storytelling:</span> Convert spoken memories into eBooks and keepsakes.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-[#F8E3C8] rounded-full p-1 mr-2 mt-0.5">
                  <div className="w-2 h-2 bg-[#674019] rounded-full"></div>
                </div>
                <span><span className="font-medium">Engagement:</span> Encourage residents to share their stories.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-[#F8E3C8] rounded-full p-1 mr-2 mt-0.5">
                  <div className="w-2 h-2 bg-[#674019] rounded-full"></div>
                </div>
                <span><span className="font-medium">Easy Integration:</span> Quick setup with dedicated support.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-[#F8E3C8] rounded-full p-1 mr-2 mt-0.5">
                  <div className="w-2 h-2 bg-[#674019] rounded-full"></div>
                </div>
                <span><span className="font-medium">Promotional Materials:</span> Resources to highlight family legacies.</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-[#242F3F] mb-3">Get Started:</h3>
            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-[#A33D29] to-[#C26E3F] text-white"
                onClick={() => window.open("mailto:richard@narrastory.com?subject=Book%20a%20Demo%20Request", "_blank")}
              >
                Book a Demo
              </Button>
              <p className="text-center text-[#403E43] text-sm">
                Discover how Narra can enrich your community's storytelling efforts.
              </p>
              <div className="border border-[#F8E3C8] rounded-xl p-4 bg-[#FBF7F1]">
                <p className="text-[#674019] font-medium mb-1">Free Trial Available</p>
                <p className="text-[#674019]/80 text-sm">Explore our platform with no obligation.</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#F8E3C8] pt-4">
            <h3 className="text-lg font-semibold text-[#242F3F] mb-2">Contact Us:</h3>
            <p className="text-[#403E43] mb-2">For inquiries, reach out at:</p>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-[#A33D29]" />
              <a href="mailto:richard@narrastory.com" className="text-[#A33D29] hover:underline">
                richard@narrastory.com
              </a>
            </div>
          </div>
          
          <div className="bg-[#F8F8F8] p-3 rounded-lg text-xs text-[#777777] italic">
            Disclaimer: Narra is dedicated to preserving memories and enhancing connections, not a substitute for professional therapeutic services.
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="border-[#242F3F]/20 text-[#242F3F]">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeniorLivingDialog;
