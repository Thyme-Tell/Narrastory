
import React from "react";
import CallNarraForm from "@/components/CallNarraForm";

interface HomeSectionProps {
  homeRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
}

const HomeSection: React.FC<HomeSectionProps> = ({ homeRef, isMobile }) => {
  return (
    <div 
      ref={homeRef}
      id="home"
      className="w-full h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat md:mt-0 mt-0"
      style={{ 
        backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//beacon.png')",
        backgroundSize: "contain", 
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-caslon font-thin mb-4 md:mb-6 leading-tight text-[#262626] fade-in-element"
          style={{ letterSpacing: "-0.02em" }}
        >
          Narrate as only <em className="italic font-caslon font-thin">you</em> can.
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-caslon mb-3 md:mb-4 text-[#262626] fade-in-element delay-200">
          Share your life stories through simple conversation.
        </h2>
        
        <p 
          className="text-base md:text-lg text-[#2F3546] mb-8 md:mb-12 max-w-2xl mx-auto fade-in-element delay-300"
          style={{ 
            fontFamily: "'Uncut Sans Variable', sans-serif", 
            fontStyle: 'normal', 
            fontWeight: 400, 
            opacity: 0.8 
          }}
        >
          Narra transforms your everyday chats into meaningful and lasting stories that capture your essence.
        </p>
        
        <div className="max-w-md mx-auto px-4 fade-in-element delay-400">
          <CallNarraForm mobileLayout={isMobile} />
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
