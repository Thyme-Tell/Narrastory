
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageNavigationLink {
  text: string;
  href: string;
  active?: boolean;
}

export const usePageNavigation = (defaultActive: string = "home") => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(defaultActive);
  
  // Create default navigation links
  const defaultLinks: PageNavigationLink[] = [
    { text: "Home", href: "/get-started", active: activeLink === "home" },
    { text: "How It Works", href: "/get-started#how-it-works", active: activeLink === "how-it-works" },
    { text: "Narra Story Circles", href: "/get-started#join-story-circle", active: activeLink === "join-story-circle" },
    { text: "Sign Up", href: "/get-started#sign-up", active: activeLink === "sign-up" }
  ];
  
  const [links, setLinks] = useState<PageNavigationLink[]>(defaultLinks);
  
  // Update links when active link changes
  useEffect(() => {
    setLinks(prevLinks => 
      prevLinks.map(link => ({
        ...link,
        active: link.href.includes(activeLink)
      }))
    );
  }, [activeLink]);
  
  // Handle link click
  const handleLinkClick = (link: PageNavigationLink) => {
    // Extract the section from the URL (after the # symbol)
    const section = link.href.includes('#') 
      ? link.href.split('#')[1] 
      : link.href === "/get-started" ? "home" : "";
    
    setActiveLink(section);
  };
  
  // Update active link based on URL on initial load
  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;
    
    if (hash) {
      const section = hash.substring(1);
      setActiveLink(section);
    } else if (path === "/get-started") {
      setActiveLink("home");
    }
  }, [location]);
  
  return { links, activeLink, handleLinkClick };
};
