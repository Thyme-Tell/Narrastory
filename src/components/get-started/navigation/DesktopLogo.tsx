
import React from "react";
import { Link } from "react-router-dom";

interface DesktopLogoProps {
  scrolled: boolean;
  scrollToTop: () => void;
}

const DesktopLogo: React.FC<DesktopLogoProps> = ({ scrolled, scrollToTop }) => {
  // Only render when not scrolled
  if (scrolled) return null;
  
  return (
    <Link 
      to="/get-started" 
      className="hidden sm:inline-block bg-[#EFF1E9]/50 rounded-[100px] p-4 lg:p-3 w-full sm:w-auto flex justify-center"
      style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
    >
      <img 
        src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
        alt="Narra Logo" 
        className="w-[130px] h-auto"
      />
    </Link>
  );
};

export default DesktopLogo;
