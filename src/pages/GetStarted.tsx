
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our new components
import Header from "@/components/get-started/Header";
import HomeSection from "@/components/get-started/HomeSection";
import HowItWorksSection from "@/components/get-started/HowItWorksSection";
import StoryCirclesSection from "@/components/get-started/StoryCirclesSection";
import SignUpSection from "@/components/get-started/SignUpSection";
import WelcomeSection from "@/components/get-started/WelcomeSection";
import { getNavItems } from "@/components/get-started/NavItems";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isMobile = useIsMobile();
  
  // References for scrolling to sections
  const homeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const storyCirclesRef = useRef<HTMLElement>(null);
  const signUpRef = useRef<HTMLElement>(null);
  
  // Get navigation items with references
  const navItems = getNavItems(homeRef, howItWorksRef, storyCirclesRef, signUpRef);
  
  useEffect(() => {
    document.title = "Narra Story | Get Started";
    
    const path = location.pathname;
    const hash = location.hash;

    if (path === "/get-started" && !hash) setActiveItem("home");
    if (hash === "#how-it-works") setActiveItem("how-it-works");
    if (hash === "#join-story-circle") setActiveItem("join-story-circle");
    if (hash === "#sign-up") setActiveItem("sign-up");
  }, [location]);

  const handleMenuItemClick = (item: any) => {
    setActiveItem(item.name);
    
    if (item.ref && item.ref.current) {
      item.ref.current.scrollIntoView({ behavior: 'smooth' });
    } else if (item.name === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF1E9] px-[7%]">
      <Header 
        navItems={navItems} 
        activeItem={activeItem} 
        handleMenuItemClick={handleMenuItemClick} 
      />

      <HomeSection homeRef={homeRef} isMobile={isMobile} />
      <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
      <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
      <SignUpSection signUpRef={signUpRef} />
      <WelcomeSection />
    </div>
  );
};

export default GetStarted;
