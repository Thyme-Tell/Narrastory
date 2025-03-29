
import React from "react";
import ProfileForm from "@/components/ProfileForm";

interface SignUpSectionProps {
  signUpRef: React.RefObject<HTMLElement>;
}

const SignUpSection: React.FC<SignUpSectionProps> = ({ signUpRef }) => {
  return (
    <section 
      ref={signUpRef as React.RefObject<HTMLElement>}
      id="sign-up"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 text-center">
          Sign Up for Narra
        </h2>
        <p className="text-base md:text-lg text-[#403E43] mb-12 text-center max-w-2xl mx-auto">
          Join Narra today and start preserving your most important stories. Create a free account to begin your storytelling journey.
        </p>
        
        <div className="bg-white rounded-xl shadow-md p-8 md:p-10 max-w-md mx-auto">
          <ProfileForm />
        </div>
      </div>
    </section>
  );
};

export default SignUpSection;
