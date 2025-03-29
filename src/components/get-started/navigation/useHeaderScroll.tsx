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
    if (item.ref && item.ref.current) {
      // Update URL with anchor without causing navigation
      if (item.anchorId) {
        window.history.pushState({}, '', `#${item.anchorId}`);
      }
      
      // Scroll to the element
      item.ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL to remove anchor
    window.history.pushState({}, '', window.location.pathname);
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
        const targetItem = navItems.find(item => item.anchorId === hash);
        if (targetItem && targetItem.ref && targetItem.ref.current) {
          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            targetItem.ref.current?.scrollIntoView({ behavior: 'smooth' });
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
