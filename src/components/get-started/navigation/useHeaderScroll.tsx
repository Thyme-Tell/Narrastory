
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
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    // Add a small delay to ensure all elements are properly rendered
    const initialTimeout = setTimeout(() => {
      handleScroll();
    }, 100);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
      
      // Get all sections with valid refs
      const sections = navItems
        .filter(item => item.ref && item.ref.current)
        .map(item => ({
          name: item.name,
          element: item.ref!.current!
        }));
      
      // Determine which section is currently in view
      let currentSection = "home";
      
      // Special case: If near the top, select home
      if (window.scrollY < 100) {
        currentSection = "home";
      } 
      // Special case: If near the bottom, select the last section
      else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
          currentSection = lastSection.name;
        }
      } 
      else {
        // Find the section that's most visible in the viewport
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        
        // Track the best matching section
        let bestSection = null;
        let bestVisibility = 0;
        
        sections.forEach(section => {
          const rect = section.element.getBoundingClientRect();
          
          // Calculate section visibility percentage in viewport
          const visibleTop = Math.max(0, rect.top);
          const visibleBottom = Math.min(viewportHeight, rect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibilityScore = visibleHeight / viewportHeight;
          
          // Boost score for sections that are in the upper half of the viewport
          const positionBoost = rect.top < viewportHeight / 2 ? 0.2 : 0;
          const adjustedScore = visibilityScore + positionBoost;
          
          // Check if this section has better visibility than current best
          if (adjustedScore > bestVisibility && visibilityScore > 0.1) {
            bestVisibility = adjustedScore;
            bestSection = section.name;
          }
          
          // Special case: If a section's top is very close to the top of viewport
          // (within 200px), prioritize this section
          if (rect.top >= -200 && rect.top <= 200) {
            bestSection = section.name;
            bestVisibility = 1; // Max priority
          }
          
          // Special case: If scrolling is at the section's beginning
          const sectionTop = scrollPosition + rect.top;
          if (Math.abs(scrollPosition - sectionTop) < 100) {
            bestSection = section.name;
            bestVisibility = 1; // Max priority
          }
        });
        
        // Update current section if a suitable section was found
        if (bestSection) {
          currentSection = bestSection;
        }
      }
      
      // Only update the active section if it's different
      if (currentSection !== activeItem) {
        const newActiveItem = navItems.find(item => item.name === currentSection);
        if (newActiveItem) {
          // Update URL hash without scrolling
          const url = new URL(window.location.href);
          url.hash = currentSection === "home" ? "" : `#${currentSection}`;
          window.history.replaceState({}, "", url.toString());
          
          // Call the handleMenuItemClick with the new active item
          handleMenuItemClick(newActiveItem);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initialTimeout);
    };
  }, [activeItem, navItems, handleMenuItemClick]);

  return { scrolled };
};

export default useHeaderScroll;
