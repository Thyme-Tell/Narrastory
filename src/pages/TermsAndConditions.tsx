
import React, { useEffect } from "react";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 sm:p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">Last Updated: August 1, 2023</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Narra Story's services, website, or mobile applications 
              (collectively, the "Services"), you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Narra Story provides a platform for users to create, share, and preserve personal stories
              and memories. Our services include story creation tools, collaborative storytelling features,
              and physical book publishing options.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              To access certain features of our Services, you may be required to create an account.
              You are responsible for maintaining the confidentiality of your account information and
              for all activities that occur under your account.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <p>
              You retain ownership of any content you submit, post, or display on or through our Services.
              By providing content to Narra Story, you grant us a worldwide, non-exclusive, royalty-free
              license to use, reproduce, modify, adapt, publish, translate, and distribute your content
              solely for the purpose of providing our Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
            <p>
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Violating any laws or regulations</li>
              <li>Infringing on the intellectual property rights of others</li>
              <li>Harassing, abusing, or harming another person</li>
              <li>Uploading or transmitting viruses or malicious code</li>
              <li>Attempting to interfere with or compromise the system integrity or security</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> to
              understand how we collect, use, and disclose information about you.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our Services at any time, without
              prior notice or liability, for any reason, including if you violate these Terms and Conditions.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. We will provide
              notice of significant changes by posting the new Terms and Conditions on our website and
              updating the "Last Updated" date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
              support@narrastory.com
            </p>
          </section>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
