
import React, { useEffect } from "react";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">NARRA PRIVACY POLICY</h1>
        
        <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 sm:p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">Last Updated: March 30, 2025</p>
          
          <p className="mb-6">
            This Privacy Policy explains how Thyme & Tell, Inc. ("Narra," "we," "us," or "our") collects, uses, and shares information about you when you use our website, mobile application, and related services (collectively, the "Service").
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. INFORMATION WE COLLECT</h2>
            
            <h3 className="text-xl font-semibold mb-2">1.1 Information You Provide</h3>
            <p>
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Create an account (name, email address, password)</li>
              <li>Complete your profile (biographical information, photos)</li>
              <li>Create and share content (stories, photos, videos, comments)</li>
              <li>Communicate with us or other users</li>
              <li>Subscribe to our services or make purchases</li>
              <li>Respond to surveys or promotions</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">1.2 Information Collected Automatically</h3>
            <p>
              When you use our Service, we automatically collect:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Usage information (pages visited, features used, time spent)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">1.3 Information from Third Parties</h3>
            <p>
              We may receive information about you from:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Family members who invite you to join Narra</li>
              <li>Social media platforms when you connect them to Narra</li>
              <li>Partners who provide services to us</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. HOW WE USE YOUR INFORMATION</h2>
            <p>
              We use your information to:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Personalize your experience</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, investigate, and prevent fraudulent or illegal activities</li>
              <li>Fulfill any other purpose disclosed to you</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. HOW WE SHARE YOUR INFORMATION</h2>
            
            <h3 className="text-xl font-semibold mb-2">3.1 With Other Users</h3>
            <ul className="list-disc pl-8 my-4">
              <li>Content you share is accessible to the family members and connections you choose</li>
              <li>Profile information may be visible to other users based on your privacy settings</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">3.2 With Service Providers</h3>
            <p>
              We may share information with third-party vendors who need access to perform services on our behalf, such as:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Cloud storage providers</li>
              <li>Payment processors</li>
              <li>Analytics providers</li>
              <li>Customer support services</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">3.3 For Legal Reasons</h3>
            <p>
              We may disclose information if we believe it's necessary to:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Comply with applicable laws or legal processes</li>
              <li>Protect the rights, property, or safety of Narra, our users, or others</li>
              <li>Detect, prevent, or address fraud or security issues</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">3.4 Business Transfers</h3>
            <p>
              If Narra is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. YOUR CHOICES AND RIGHTS</h2>
            
            <h3 className="text-xl font-semibold mb-2">4.1 Account Information</h3>
            <p>
              You can update your account information and preferences at any time through your account settings.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.2 Content Sharing and Privacy Settings</h3>
            <p>
              You control who can see your content through our privacy settings. However, recipients may save or download copies of your content.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.3 Marketing Communications</h3>
            <p>
              You can opt out of marketing communications by following the unsubscribe instructions in our emails or by contacting us.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.4 Cookies and Tracking</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. However, refusing cookies may limit your ability to use certain features.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">4.5 Data Rights</h3>
            <p>
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your information</li>
              <li>Export your information</li>
              <li>Restrict certain processing of your information</li>
            </ul>
            <p>
              To exercise these rights, please contact us at support@narrastory.com.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. DATA RETENTION</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. We may retain certain information even after you delete your account as required by law or for legitimate business purposes.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. DATA SECURITY</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. CHILDREN'S PRIVACY</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect information from children under 13. If we learn we have collected information from a child under 13, we will delete that information.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. INTERNATIONAL DATA TRANSFERS</h2>
            <p>
              We may transfer, store, and process your information in countries other than your own. By using the Service, you consent to the transfer of information to countries that may have different data protection rules than your country.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. CHANGES TO THIS PRIVACY POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website or through the Service. Your continued use after such changes indicates your acceptance of the revised policy.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. CONTACT US</h2>
            <p>
              If you have questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <p className="mt-4">
              Email: support@narrastory.com<br />
              Address: Thyme & Tell, Inc., Minneapolis, MN 55317
            </p>
          </section>
        </div>
        
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
