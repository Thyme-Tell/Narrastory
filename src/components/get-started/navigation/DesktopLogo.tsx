
import React from "react";

interface DesktopLogoProps {
  scrolled: boolean;
  scrollToTop: () => void;
}

const DesktopLogo: React.FC<DesktopLogoProps> = ({ scrolled, scrollToTop }) => {
  return (
    <div 
      className="hidden sm:flex items-center justify-center bg-[#EFF1E9]/50 rounded-[100px] p-2 cursor-pointer"
      onClick={scrollToTop}
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
          className="w-[100px] h-auto"
        />
      )}
    </div>
  );
};

export default DesktopLogo;
