
import { useState, useEffect } from 'react';
import { NavItem } from "../NavItems";

interface UseHeaderScrollProps {
  navItems: NavItem[];
  activeItem: string;
  handleMenuItemClick: (item: NavItem) => void;
}

export const useHeaderScroll = ({ 
  navItems, 
  activeItem, 
  handleMenuItemClick 
}: UseHeaderScrollProps) => {
  // Track scroll state
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(activeItem);

  // Function to scroll to a section
  const scrollToSection = (item: NavItem) => {
    // Handle "home" specially - scroll to top
    if (item.name === "home") {
      scrollToTop();
      return;
    }
    
    if (item.ref && item.ref.current) {
      // Update URL with anchor without causing navigation
      if (item.anchorId) {
        window.history.pushState({}, '', `#${item.anchorId}`);
      }
      
      // Scroll to the element with offset to account for sticky header
      const headerOffset = 80;
      const elementPosition = item.ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL to include home anchor
    window.history.pushState({}, '', `#home`);
  };

  useEffect(() => {
    // Function to check if element is in viewport
    const isElementInViewport = (el: Element): boolean => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Consider an element visible if its top is in the top half of the viewport
      // or if it's the first element and we're at the top of the page
      return (
        (rect.top >= 0 && rect.top < windowHeight * 0.5) || 
        (rect.top < 0 && rect.bottom > windowHeight * 0.5)
      );
    };

    // Function to handle scroll events
    const handleScroll = () => {
      // Set scrolled state based on scroll position
      const isScrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) {
        setScrolled(isScrolled);
      }
      
      // Check which section is currently visible
      let foundVisibleSection = false;
      
      // Special case: if we're at the top of the page, set "home" as active
      if (window.scrollY < 100) {
        if (activeSection !== "home") {
          setActiveSection("home");
          window.history.pushState({}, '', `#home`);
        }
        return;
      }
      
      // We reverse the array to check from bottom to top
      // This ensures we highlight the section closest to the top when multiple are visible
      [...navItems].reverse().forEach(item => {
        if (!foundVisibleSection && item.ref && item.ref.current) {
          const element = item.ref.current;
          if (isElementInViewport(element)) {
            foundVisibleSection = true;
            if (activeSection !== item.name) {
              setActiveSection(item.name);
              // Update URL with anchor without causing navigation
              if (item.anchorId) {
                window.history.pushState({}, '', `#${item.anchorId}`);
              }
            }
          }
        }
      });
      
      // If no section is visible (e.g., in between sections), keep the current activeSection
    };

    // Handle initial hash in URL
    const handleInitialHash = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // If hash is "home", scroll to top
        if (hash === "home") {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        const targetItem = navItems.find(item => item.anchorId === hash);
        if (targetItem && targetItem.ref && targetItem.ref.current) {
          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = targetItem.ref.current?.getBoundingClientRect().top || 0;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    };

    // Set up scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once to initialize
    handleScroll();
    handleInitialHash();
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navItems, scrolled, activeSection, handleMenuItemClick]);

  return { 
    scrolled,
    activeSection,
    scrollToSection,
    scrollToTop
  };
};

export default useHeaderScroll;
