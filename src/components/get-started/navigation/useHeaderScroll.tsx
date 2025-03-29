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
  const [isScrolling, setIsScrolling] = useState(false);

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
      // Don't update active section if currently programmatically scrolling
      if (isScrolling) return;
      
      // Set scrolled state based on scroll position
      const isScrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) {
        setScrolled(isScrolled);
      }
      
      // Check which section is currently visible
      let foundVisibleSection = false;
      
      // We reverse the array to check from bottom to top
      // This ensures we highlight the section closest to the top when multiple are visible
      [...navItems].reverse().forEach(item => {
        if (!foundVisibleSection && item.ref && item.ref.current) {
          const element = item.ref.current;
          if (isElementInViewport(element)) {
            foundVisibleSection = true;
            if (activeSection !== item.name) {
              setActiveSection(item.name);
              // Don't call handleMenuItemClick here as it would cause unwanted scrolling
            }
          }
        }
      });
      
      // If no section is visible (e.g., in between sections), keep the current activeSection
    };

    // Set up scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once to initialize
    handleScroll();
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navItems, scrolled, activeSection, handleMenuItemClick, isScrolling]);

  // Function to scroll to a section when a menu item is clicked
  const scrollToSection = (item: NavItem) => {
    if (item.ref && item.ref.current) {
      setIsScrolling(true);
      setActiveSection(item.name);
      
      // Add a small offset to account for the header height
      const headerOffset = 100;
      const elementPosition = item.ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Reset isScrolling after the scroll animation is likely complete
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  return { 
    scrolled,
    activeSection,
    scrollToSection
  };
};

export default useHeaderScroll;
