
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <div className="max-w-6xl mx-auto bg-white rounded-[7px] shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Panel - Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-caslon font-medium text-[#242F3F] mb-3">
                  Join Narra
                </h2>
                <p className="text-sm text-[#403E43]/80">
                  Preserve your most meaningful stories for generations to come, wherever you are, whenever you want.
                </p>
              </div>
              
              <div className="flex flex-col gap-6">
                <ProfileForm />
              </div>
            </div>
          </div>
          
          {/* Right Panel - Testimonial */}
          <div className="hidden md:block relative">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narrafamily.jpg')" 
              }}
            ></div>
            <div className="absolute inset-0 bg-atlantic/60 z-10"></div>
            <div className="relative z-20 flex flex-col justify-center h-full text-white p-12">
              <div className="bg-[#1d2532]/80 backdrop-blur-sm rounded-[7px] p-8 shadow-lg">
                <svg className="text-[#A33D29] h-10 w-10 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.135 9H4.5C4.33431 9 4.2 8.86569 4.2 8.7V4.5C4.2 4.33431 4.33431 4.2 4.5 4.2H8.7C8.86569 4.2 9 4.33431 9 4.5V8.865M9.135 9C9.06 9 9 8.94 9 8.865V4.5M9.135 9H19.5C19.6657 9 19.8 9.13431 19.8 9.3V13.5C19.8 13.6657 19.6657 13.8 19.5 13.8H15.3C15.1343 13.8 15 13.6657 15 13.5V9.135C15 9.06 15.06 9 15.135 9H19.5M9 4.5H19.5C19.6657 4.5 19.8 4.33431 19.8 4.5V8.7C19.8 8.86569 19.6657 9 19.5 9M9 4.5V3M19.5 9V3M9 19.5H4.5C4.33431 19.5 4.2 19.6657 4.2 19.5V15.3C4.2 15.1343 4.33431 15 4.5 15H8.7C8.86569 15 9 15.1343 9 15.3V19.5ZM9 19.5H19.5C19.6657 19.5 19.8 19.6657 19.8 19.5V15.3C19.8 15.1343 19.6657 15 19.5 15H15.3C15.1343 15 15 15.1343 15 15.3V19.5M9 19.5V21M15 19.5V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <blockquote className="mb-6">
                  <p className="text-white/90 text-lg font-caslon italic mb-4">
                    "Narra helped our family preserve the incredible stories of my grandmother's childhood that would have otherwise been lost forever. Now my children and their children will know where they came from."
                  </p>
                  <footer className="text-white/80">
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm">Family Historian, Mother of 3</p>
                  </footer>
                </blockquote>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className="w-5 h-5 text-[#A33D29]" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpSection;
