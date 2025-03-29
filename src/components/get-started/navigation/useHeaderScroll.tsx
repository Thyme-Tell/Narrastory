
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
      
      // Default to home when near the top of the page
      let currentSection = "home";
      
      if (window.scrollY < 100) {
        currentSection = "home";
      } else {
        // Get the viewport height and current scroll position
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY + (viewportHeight * 0.3); // Slightly biased towards top
        
        // Sort sections by their position from top to bottom
        const sortedSections = [...sections].sort((a, b) => {
          const rectA = a.element.getBoundingClientRect();
          const rectB = b.element.getBoundingClientRect();
          return (rectA.top + window.scrollY) - (rectB.top + window.scrollY);
        });
        
        // Find the most appropriate section
        for (let i = 0; i < sortedSections.length; i++) {
          const section = sortedSections[i];
          const rect = section.element.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY - 150; // Offset for header
          
          // Check if current scroll position is past this section's top
          if (scrollPosition >= sectionTop) {
            currentSection = section.name;
            
            // Peek at next section to ensure precise highlighting
            if (i < sortedSections.length - 1) {
              const nextSection = sortedSections[i + 1];
              const nextRect = nextSection.element.getBoundingClientRect();
              const nextSectionTop = nextRect.top + window.scrollY - 150;
              
              // If very close to next section, switch to it
              if (scrollPosition >= nextSectionTop - 100) {
                currentSection = nextSection.name;
              }
            }
          }
        }
        
        // Special case for bottom of the page
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        if (isAtBottom && sortedSections.length > 0) {
          const lastSection = sortedSections[sortedSections.length - 1];
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
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeItem, navItems, handleMenuItemClick]);

  return { scrolled };
};

export default useHeaderScroll;

