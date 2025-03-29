
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
          
          {/* Right Panel - Image or Info */}
          <div className="hidden md:block relative">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narrafamily.jpg')" 
              }}
            ></div>
            <div className="absolute inset-0 bg-atlantic/60 z-10"></div>
            <div className="relative z-20 flex flex-col justify-center h-full text-white p-12">
              <div className="text-center mb-6">
                <p className="text-white/80 text-sm uppercase tracking-wide">Preserve Your Legacy</p>
                <h2 className="text-3xl font-caslon mt-2 mb-4">Family Stories.<br />Forever.</h2>
              </div>
              
              <div className="bg-[#1d2532]/80 backdrop-blur-sm rounded-[7px] p-6 shadow-lg mx-auto max-w-xs">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-white/60 text-xs">STORIES</p>
                    <p className="text-xl font-medium">24 Family Memories</p>
                  </div>
                  
                  <div className="w-full h-40 bg-gradient-to-br from-[#A33D29]/90 to-[#A33D29]/60 rounded-[7px] flex items-center justify-center">
                    <span className="font-caslon text-2xl">Narra Book</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="w-full bg-white/10 h-2 rounded-full">
                      <div className="bg-[#A33D29] h-2 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs text-white/60 text-right">75% Complete</p>
                  </div>
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
