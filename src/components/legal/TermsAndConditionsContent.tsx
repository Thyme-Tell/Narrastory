
import React from "react";
import TermsSection from "./TermsSection";
import SubSection from "./SubSection";

const TermsAndConditionsContent: React.FC = () => {
  return (
    <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 sm:p-8 shadow-sm">
      <p className="text-muted-foreground mb-6">Last Updated: March 30, 2025</p>
      
      <p className="mb-6">
        Welcome to Narra! This User Agreement ("Agreement") is a legally binding contract between you and Thyme & Tell, Inc. ("Narra," "we," "us," or "our") that governs your use of the Narra platform, including our website, mobile application, and related services (collectively, the "Service").
      </p>
      
      <TermsSection title="1. ACCEPTANCE OF TERMS">
        <p>
          By accessing or using the Service, you agree to be bound by this Agreement and our Privacy Policy, which is incorporated by reference. If you do not agree to these terms, please do not use the Service. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to this Agreement.
        </p>
      </TermsSection>
      
      <TermsSection title="2. ELIGIBILITY">
        <p>
          You must be at least 13 years of age to use the Service. If you are under 18, you represent that you have your parent's or legal guardian's permission to use the Service. Some features may have additional age restrictions.
        </p>
      </TermsSection>
      
      <TermsSection title="3. ACCOUNT CREATION AND SECURITY">
        <SubSection title="3.1 Registration">
          <p>
            To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </p>
        </SubSection>
        
        <SubSection title="3.2 Account Security">
          <p>
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify Narra immediately of any unauthorized use of your account.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="4. CONTENT AND LICENSES">
        <SubSection title="4.1 Your Content">
          <p>
            You retain ownership of any content you create, upload, or share through the Service ("User Content"). By submitting User Content, you grant Narra a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with providing and promoting the Service.
          </p>
        </SubSection>
        
        <SubSection title="4.2 Family Stories and Collaborative Content">
          <p>
            When you share stories or collaborate with family members, you understand that those individuals will have access to the content you share. You control the privacy settings for your content, but once shared, recipients may save or download copies.
          </p>
        </SubSection>
        
        <SubSection title="4.3 Prohibited Content">
          <p>
            You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, or otherwise objectionable.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="5. SUBSCRIPTION AND PAYMENT">
        <SubSection title="5.1 Subscription Options">
          <p>
            Narra offers both free and paid subscription plans. Features available under each plan are described on our website.
          </p>
        </SubSection>
        
        <SubSection title="5.2 Payment Terms">
          <p>
            If you choose a paid subscription, you agree to pay all fees in accordance with the pricing and payment terms presented to you. All payments are non-refundable except as required by law or as explicitly stated in this Agreement.
          </p>
        </SubSection>
        
        <SubSection title="5.3 Automatic Renewal">
          <p>
            Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period. You can manage your subscription and turn off auto-renewal in your account settings.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="6. TERMINATION">
        <SubSection title="6.1 Termination by You">
          <p>
            You may terminate your account at any time by following the instructions on the Service or by contacting us.
          </p>
        </SubSection>
        
        <SubSection title="6.2 Termination by Narra">
          <p>
            Narra may suspend or terminate your access to the Service if you violate this Agreement or if we reasonably believe that you have violated applicable laws.
          </p>
        </SubSection>
        
        <SubSection title="6.3 Effect of Termination">
          <p>
            Upon termination, your right to use the Service will immediately cease. Sections 4, 7, 8, 9, and 10 will survive termination.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="7. INTELLECTUAL PROPERTY">
        <SubSection title="7.1 Narra Property">
          <p>
            The Service and its original content, features, and functionality are owned by Narra and are protected by copyright, trademark, and other intellectual property laws.
          </p>
        </SubSection>
        
        <SubSection title="7.2 Feedback">
          <p>
            If you provide feedback or suggestions about the Service, you grant Narra the right to use this feedback without restriction or compensation.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="8. DISCLAIMERS AND LIMITATIONS OF LIABILITY">
        <SubSection title="8.1 \"As Is\" Service">
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
        </SubSection>
        
        <SubSection title="8.2 Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NARRA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>
        </SubSection>
      </TermsSection>
      
      <TermsSection title="9. INDEMNIFICATION">
        <p>
          You agree to indemnify and hold harmless Narra and its officers, directors, employees, and agents from any claims, damages, liabilities, costs, or expenses arising from your use of the Service or violation of this Agreement.
        </p>
      </TermsSection>
      
      <TermsSection title="10. GENERAL PROVISIONS">
        <SubSection title="10.1 Governing Law">
          <p>
            This Agreement is governed by the laws of the state of California without regard to its conflict of law principles.
          </p>
        </SubSection>
        
        <SubSection title="10.2 Dispute Resolution">
          <p>
            Any dispute arising from this Agreement shall first be attempted to be resolved through informal negotiation. If that fails, disputes shall be resolved through binding arbitration in San Francisco, California.
          </p>
        </SubSection>
        
        <SubSection title="10.3 Changes to the Agreement">
          <p>
            Narra may modify this Agreement at any time. We will notify you of material changes by posting the updated Agreement on our website or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the revised Agreement.
          </p>
        </SubSection>
        
        <SubSection title="10.4 Entire Agreement">
          <p>
            This Agreement, together with the Privacy Policy, constitutes the entire agreement between you and Narra regarding the Service.
          </p>
        </SubSection>
      </TermsSection>
    </div>
  );
};

export default TermsAndConditionsContent;
