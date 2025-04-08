
import React from "react";
import { Check } from "lucide-react";

const SocialProofBanner: React.FC = () => {
  return (
    <div className="bg-[#242F3F] text-white py-6 px-4 rounded-lg mx-auto max-w-6xl -mt-10 relative z-20 shadow-lg mb-16">
      <div className="flex flex-col md:flex-row justify-around items-center text-center gap-4">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-[#A33D29] mr-2" />
          <span className="text-sm md:text-base">Used in 50+ communities nationwide</span>
        </div>
        
        <div className="hidden md:block h-10 w-px bg-white/20"></div>
        
        <div className="flex items-center">
          <Check className="h-5 w-5 text-[#A33D29] mr-2" />
          <span className="text-sm md:text-base">4.9/5 Activity Director Rating</span>
        </div>
        
        <div className="hidden md:block h-10 w-px bg-white/20"></div>
        
        <div className="flex items-center">
          <Check className="h-5 w-5 text-[#A33D29] mr-2" />
          <span className="text-sm md:text-base">1000+ Stories Preserved</span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofBanner;
