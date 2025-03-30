
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import useHeaderScroll from "@/components/get-started/navigation/useHeaderScroll";

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
  
  // Use our scroll hook to detect active section
  useHeaderScroll({ 
    navItems, 
    activeItem, 
    setActiveItem: (item) => setActiveItem(item) 
  });

  useEffect(() => {
    document.title = "Narra Story | Get Started";
    
    // Check for hash in URL on initial load and scroll to that section
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Set active item based on hash
        const matchingItem = navItems.find(item => item.anchorId === id);
        if (matchingItem) {
          setActiveItem(matchingItem.name);
        }
      }
    }
  }, [location]);

  const handleMenuItemClick = (item: any) => {
    setActiveItem(item.name);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <div className="px-[7%]">
        <Header 
          navItems={navItems} 
          activeItem={activeItem} 
          handleMenuItemClick={handleMenuItemClick} 
        />

        {/* Add appropriate scroll-margin-top to each section */}
        <div id="home" className="scroll-mt-24">
          <HomeSection homeRef={homeRef} isMobile={isMobile} />
        </div>
        <section id="how-it-works" className="scroll-mt-24">
          <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
        </section>
        <section id="join-story-circle" className="scroll-mt-24 bg-transparent">
          <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
        </section>
        <section id="sign-up" className="scroll-mt-24">
          <SignUpSection signUpRef={signUpRef} />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default GetStarted;
