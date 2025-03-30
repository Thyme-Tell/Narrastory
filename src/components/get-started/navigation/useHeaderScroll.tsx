
import { useState, useEffect } from 'react';
import { NavItem } from "../NavItems";

interface UseHeaderScrollProps {
  navItems: NavItem[];
  activeItem: string;
  setActiveItem: (item: string) => void;
}

export const useHeaderScroll = ({ 
  navItems,
  activeItem,
  setActiveItem
}: UseHeaderScrollProps) => {
  // Set scrolled state to false as we're removing scroll functionality
  const [scrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Check which section is in the viewport
      const sections = navItems.map(item => {
        if (!item.anchorId) return null;
        return document.getElementById(item.anchorId);
      }).filter(Boolean);
      
      // Find the current section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (!section) continue;
        
        const sectionTop = section.offsetTop - 100; // Adjust for header
        if (scrollPosition >= sectionTop) {
          const correspondingNavItem = navItems.find(item => item.anchorId === section.id);
          if (correspondingNavItem && correspondingNavItem.name !== activeItem) {
            setActiveItem(correspondingNavItem.name);
          }
          break;
        }
      }
      
      // If scroll position is at the top, set home as active
      if (scrollPosition < 100) {
        setActiveItem("home");
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navItems, activeItem, setActiveItem]);

  return { 
    scrolled,
    activeSection: activeItem
  };
};

export default useHeaderScroll;
