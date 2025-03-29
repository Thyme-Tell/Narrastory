
import { useEffect, useState } from 'react';

export interface Section {
  id: string;
  ref: React.RefObject<HTMLElement>;
}

export const useScrollToSection = (sections: Section[], offset: number = 100) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [scrolled, setScrolled] = useState(false);

  // Function to scroll to a specific section
  const scrollToSection = (sectionId: string) => {
    const section = sections.find(section => section.id === sectionId);
    
    if (section?.ref?.current) {
      // Get the top position of the section
      const sectionTop = section.ref.current.getBoundingClientRect().top + window.scrollY;
      
      // Scroll to the section with an offset
      window.scrollTo({
        top: sectionTop - offset,
        behavior: 'smooth'
      });
      
      // Update URL hash without scrolling again
      const url = new URL(window.location.href);
      url.hash = sectionId === "home" ? "" : sectionId;
      window.history.replaceState({}, "", url.toString());
      
      // Update active section
      setActiveSection(sectionId);
    }
  };

  // Listen for scroll events to update active section
  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled state for header styling
      setScrolled(window.scrollY > 50);
      
      // If near the top, select home
      if (window.scrollY < 100) {
        if (activeSection !== sections[0]?.id) {
          setActiveSection(sections[0]?.id || '');
        }
        return;
      }
      
      // Find the section that's currently in view
      // We'll consider a section in view if it's within the viewport
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref?.current) {
          const rect = section.ref.current.getBoundingClientRect();
          
          // Check if section is in viewport
          if (rect.top <= offset + 50 && rect.bottom > 0) {
            if (activeSection !== section.id) {
              // Update URL hash without scrolling
              const url = new URL(window.location.href);
              url.hash = section.id === "home" ? "" : section.id;
              window.history.replaceState({}, "", url.toString());
              
              setActiveSection(section.id);
            }
            break;
          }
        }
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initialize based on current URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const section = sections.find(s => s.id === hash);
      if (section) {
        setTimeout(() => scrollToSection(hash), 100);
      }
    }
    
    // Initial scroll check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, activeSection, offset]);

  return { activeSection, scrolled, scrollToSection };
};
