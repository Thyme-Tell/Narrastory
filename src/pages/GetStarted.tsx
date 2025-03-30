import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our components
import Header from "@/components/get-started/Header";
import HomeSection from "@/components/get-started/HomeSection";
import HowItWorksSection from "@/components/get-started/HowItWorksSection";
import StoryCirclesSection from "@/components/get-started/StoryCirclesSection";
import SignUpSection from "@/components/get-started/SignUpSection";
import Footer from "@/components/get-started/Footer";
import { getNavItems } from "@/components/get-started/NavItems";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isMobile = useIsMobile();
  
  // References for sections (keeping refs but not using them for scrolling)
  const homeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const storyCirclesRef = useRef<HTMLElement>(null);
  const signUpRef = useRef<HTMLElement>(null);
  
  // Get navigation items with references
  const navItems = getNavItems(homeRef, howItWorksRef, storyCirclesRef, signUpRef);
  
  useEffect(() => {
    document.title = "Narra Story | Get Started";
  }, []);

  const handleMenuItemClick = (item: any) => {
    setActiveItem(item.name);
  };

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <div className="px-[7%]">
        <Header 
          navItems={navItems} 
          activeItem={activeItem} 
          handleMenuItemClick={handleMenuItemClick} 
        />

        {/* Keep section IDs for structure but remove scroll functionality */}
        <div id="home">
          <HomeSection homeRef={homeRef} isMobile={isMobile} />
        </div>
        <section id="how-it-works">
          <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
        </section>
        <section id="join-story-circle">
          <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
        </section>
        <section id="sign-up">
          <SignUpSection signUpRef={signUpRef} />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default GetStarted;
