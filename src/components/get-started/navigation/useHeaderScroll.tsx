
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
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
      
      // Check which section is currently visible
      const sections = navItems
        .filter(item => item.ref && item.ref.current)
        .map(item => ({
          name: item.name,
          element: item.ref!.current!
        }));
      
      if (sections.length === 0) return;
      
      // Get the section that is most visible in the viewport
      let currentSection = "home";
      
      // Default to home when near the top of the page
      if (window.scrollY < 100) {
        currentSection = "home";
      } else {
        // Find the section that's currently most visible in the viewport
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY + viewportHeight * 0.3; // Bias towards the top of the viewport
        
        // Find the section whose top is closest to but below our scroll position
        let mostVisibleSection = null;
        let smallestDistance = Infinity;
        
        sections.forEach(section => {
          const rect = section.element.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY - 120; // Offset for header
          
          // Calculate how far this section is from our target scroll position
          if (sectionTop <= scrollPosition) {
            const distance = scrollPosition - sectionTop;
            if (distance < smallestDistance) {
              smallestDistance = distance;
              mostVisibleSection = section;
            }
          }
        });
        
        // If we found a section, use it
        if (mostVisibleSection) {
          currentSection = mostVisibleSection.name;
        }
        
        // Special case for last section - if we're at the bottom of the page
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        if (isAtBottom) {
          const lastSection = sections[sections.length - 1];
          currentSection = lastSection.name;
        }
      }
      
      // Update the active section if it's different
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
    
    // Initial scroll check - run after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeItem, navItems, handleMenuItemClick]);

  return { scrolled };
};

export default useHeaderScroll;
