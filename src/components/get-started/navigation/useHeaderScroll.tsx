
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
      
      // Get the section that is most visible in the viewport
      let currentSection = "home";
      
      if (window.scrollY < 100) {
        // If near the top, select home
        currentSection = "home";
      } else {
        // Find the section that's currently most visible
        let maxVisibleSection = null;
        let maxVisiblePercentage = 0;
        
        sections.forEach(section => {
          const rect = section.element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate how much of the section is visible
          const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
          const sectionHeight = rect.height;
          const visiblePercentage = visibleHeight / sectionHeight;
          
          if (visiblePercentage > maxVisiblePercentage && visiblePercentage > 0.2) {
            maxVisiblePercentage = visiblePercentage;
            maxVisibleSection = section.name;
          }
        });
        
        if (maxVisibleSection) {
          currentSection = maxVisibleSection;
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeItem, navItems, handleMenuItemClick]);

  return { scrolled };
};

export default useHeaderScroll;
