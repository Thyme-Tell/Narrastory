
import React from "react";
import { Link } from "react-router-dom";

interface DesktopLogoProps {
  scrolled: boolean;
}

const DesktopLogo: React.FC<DesktopLogoProps> = ({ scrolled }) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="hidden sm:block">
      <a 
        href="#home"
        onClick={handleLogoClick}
        className="bg-[#EFF1E9]/50 rounded-[100px] p-2 block"
        style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
      >
        {scrolled ? (
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon.svg" 
            alt="Narra Icon" 
            className="w-[30px] h-auto"
          />
        ) : (
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
            alt="Narra Logo" 
            className="w-[130px] h-auto"
          />
        )}
      </a>
    </div>
  );
};

export default DesktopLogo;
