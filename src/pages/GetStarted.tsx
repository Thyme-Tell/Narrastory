
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
  
  // References for sections
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

    // Handle navigation based on URL hash
    if (hash) {
      const targetSection = hash.substring(1); // Remove the # character
      const selectedItem = navItems.find(item => {
        // Extract the section name from the path (after the #)
        const itemHash = item.path.includes('#') ? item.path.split('#')[1] : '';
        return itemHash === targetSection;
      });
      
      if (selectedItem) {
        setActiveItem(selectedItem.name);
        // Scroll to the section with a small delay to ensure DOM is ready
        setTimeout(() => {
          if (selectedItem.ref && selectedItem.ref.current) {
            selectedItem.ref.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (path === "/get-started") {
      setActiveItem("home");
      // Scroll to top when navigating to home
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location, navItems]);

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

        <HomeSection homeRef={homeRef} isMobile={isMobile} />
        <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
        <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
        <SignUpSection signUpRef={signUpRef} />
      </div>
      <Footer />
    </div>
  );
};

export default GetStarted;
