
import React, { useEffect } from "react";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";
import { Link } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = "Narra Story | Privacy Policy";
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <LegalPageHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">PRIVACY POLICY</h1>
        
        <PrivacyPolicyContent />
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
          <span className="mx-2">•</span>
          <Link to="/terms-and-conditions" className="text-primary hover:underline">Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
