
import React, { useEffect } from "react";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import TermsAndConditionsContent from "@/components/legal/TermsAndConditionsContent";
import { Link } from "react-router-dom";

const TermsAndConditions: React.FC = () => {
  useEffect(() => {
    document.title = "Narra Story | Terms and Conditions";
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <LegalPageHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">USER AGREEMENT</h1>
        
        <TermsAndConditionsContent />
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
