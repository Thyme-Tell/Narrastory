
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

    // Handle initial navigation based on URL hash
    if (hash) {
      const targetSection = hash.substring(1); // Remove the # character
      const selectedItem = navItems.find(item => item.name === targetSection);
      
      if (selectedItem) {
        setActiveItem(selectedItem.name);
        
        // Add a small delay to ensure the DOM is fully loaded
        setTimeout(() => {
          if (selectedItem.ref && selectedItem.ref.current) {
            const sectionTop = selectedItem.ref.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: sectionTop - 100, // Offset for header
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    } else if (path === "/get-started") {
      setActiveItem("home");
    }
  }, [location, navItems]);

  const handleMenuItemClick = (item: any) => {
    setActiveItem(item.name);
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
