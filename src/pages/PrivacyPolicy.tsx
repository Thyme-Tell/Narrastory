
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-atlantic">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 sm:p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">Last Updated: August 1, 2023</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              At Narra Story, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our website, mobile application,
              and services (collectively, the "Services").
            </p>
            <p className="mt-4">
              Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge
              that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Create an account</li>
              <li>Fill out a form</li>
              <li>Sign up for our newsletter</li>
              <li>Contact customer support</li>
              <li>Use certain features of our Services</li>
            </ul>
            <p>
              This information may include your name, email address, phone number, and profile information.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">2.2 Content Data</h3>
            <p>
              When you use our Services to create and share stories, we collect the content data you provide,
              including text, images, audio recordings, and other materials you upload or create.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">2.3 Usage Information</h3>
            <p>
              We automatically collect certain information about your device and how you interact with our Services,
              including:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Access times and pages viewed</li>
              <li>Actions taken within the Services</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>
              We may use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Provide, maintain, and improve our Services</li>
              <li>Process and fulfill orders for physical books</li>
              <li>Communicate with you about your account or our Services</li>
              <li>Send you marketing and promotional materials (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Protect the security and integrity of our Services</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>With service providers who help us operate our business</li>
              <li>With other users when you choose to share your stories</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business transaction, such as a merger or acquisition</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information,
              including the right to:
            </p>
            <ul className="list-disc pl-8 my-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
            <p>
              We implement reasonable security measures to protect your information from unauthorized
              access, disclosure, alteration, or destruction. However, no method of transmission over
              the Internet or electronic storage is 100% secure.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p>
              Our Services are not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting the new Privacy Policy on our website and updating the "Last Updated" date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices,
              please contact us at: privacy@narrastory.com
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
