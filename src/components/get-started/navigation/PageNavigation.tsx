
import React from "react";
import { Link } from "react-router-dom";

interface PageNavigationLink {
  text: string;
  href: string;
  active?: boolean;
}

interface PageNavigationProps {
  links: PageNavigationLink[];
  defaultActive?: string;
  onLinkClick?: (link: PageNavigationLink) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ 
  links, 
  defaultActive = "home",
  onLinkClick 
}) => {
  return (
    <nav className="flex items-center justify-center bg-[#333333]/60 backdrop-blur-md rounded-[4px] p-[3px] shadow-sm whitespace-nowrap overflow-x-auto">
      {links.map((link, index) => (
        <Link
          key={index}
          to={link.href}
          onClick={(e) => {
            if (onLinkClick) {
              e.preventDefault();
              onLinkClick(link);
            }
          }}
          className={`flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap text-white m-[2px] my-auto transition-colors w-full sm:w-auto ${
            link.active 
              ? "bg-[#17342C]" // Timber green color for active link
              : "hover:bg-[#17342C]/10"
          }`}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
};

export default PageNavigation;
