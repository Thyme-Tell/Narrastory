
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">USER AGREEMENT</h1>
        
        <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 sm:p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">Last Updated: March 30, 2025</p>
          
          <p className="mb-6">
            Welcome to Narra! This User Agreement ("Agreement") is a legally binding contract between you and Thyme & Tell, Inc. ("Narra," "we," "us," or "our") that governs your use of the Narra platform, including our website, mobile application, and related services (collectively, the "Service").
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing or using the Service, you agree to be bound by this Agreement and our Privacy Policy, which is incorporated by reference. If you do not agree to these terms, please do not use the Service. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to this Agreement.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. ELIGIBILITY</h2>
            <p>
              You must be at least 13 years of age to use the Service. If you are under 18, you represent that you have your parent's or legal guardian's permission to use the Service. Some features may have additional age restrictions.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. ACCOUNT CREATION AND SECURITY</h2>
            
            <h3 className="text-xl font-semibold mb-2">3.1 Registration</h3>
            <p>
              To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify Narra immediately of any unauthorized use of your account.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. CONTENT AND LICENSES</h2>
            
            <h3 className="text-xl font-semibold mb-2">4.1 Your Content</h3>
            <p>
              You retain ownership of any content you create, upload, or share through the Service ("User Content"). By submitting User Content, you grant Narra a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with providing and promoting the Service.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.2 Family Stories and Collaborative Content</h3>
            <p>
              When you share stories or collaborate with family members, you understand that those individuals will have access to the content you share. You control the privacy settings for your content, but once shared, recipients may save or download copies.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.3 Prohibited Content</h3>
            <p>
              You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, or otherwise objectionable.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. SUBSCRIPTION AND PAYMENT</h2>
            
            <h3 className="text-xl font-semibold mb-2">5.1 Subscription Options</h3>
            <p>
              Narra offers both free and paid subscription plans. Features available under each plan are described on our website.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">5.2 Payment Terms</h3>
            <p>
              If you choose a paid subscription, you agree to pay all fees in accordance with the pricing and payment terms presented to you. All payments are non-refundable except as required by law or as explicitly stated in this Agreement.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">5.3 Automatic Renewal</h3>
            <p>
              Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period. You can manage your subscription and turn off auto-renewal in your account settings.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. TERMINATION</h2>
            
            <h3 className="text-xl font-semibold mb-2">6.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by following the instructions on the Service or by contacting us.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">6.2 Termination by Narra</h3>
            <p>
              Narra may suspend or terminate your access to the Service if you violate this Agreement or if we reasonably believe that you have violated applicable laws.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">6.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the Service will immediately cease. Sections 4, 7, 8, 9, and 10 will survive termination.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. INTELLECTUAL PROPERTY</h2>
            
            <h3 className="text-xl font-semibold mb-2">7.1 Narra Property</h3>
            <p>
              The Service and its original content, features, and functionality are owned by Narra and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">7.2 Feedback</h3>
            <p>
              If you provide feedback or suggestions about the Service, you grant Narra the right to use this feedback without restriction or compensation.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. DISCLAIMERS AND LIMITATIONS OF LIABILITY</h2>
            
            <h3 className="text-xl font-semibold mb-2">8.1 "As Is" Service</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">8.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NARRA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. INDEMNIFICATION</h2>
            <p>
              You agree to indemnify and hold harmless Narra and its officers, directors, employees, and agents from any claims, damages, liabilities, costs, or expenses arising from your use of the Service or violation of this Agreement.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. GENERAL PROVISIONS</h2>
            
            <h3 className="text-xl font-semibold mb-2">10.1 Governing Law</h3>
            <p>
              This Agreement is governed by the laws of the state of California without regard to its conflict of law principles.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">10.2 Dispute Resolution</h3>
            <p>
              Any dispute arising from this Agreement shall first be attempted to be resolved through informal negotiation. If that fails, disputes shall be resolved through binding arbitration in San Francisco, California.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">10.3 Changes to the Agreement</h3>
            <p>
              Narra may modify this Agreement at any time. We will notify you of material changes by posting the updated Agreement on our website or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the revised Agreement.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">10.4 Entire Agreement</h3>
            <p>
              This Agreement, together with the Privacy Policy, constitutes the entire agreement between you and Narra regarding the Service.
            </p>
          </section>
        </div>
        
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
