
import React from "react";

interface NarraLogoProps {
  handleLogoClick: (e: React.MouseEvent) => void;
}

const NarraLogo: React.FC<NarraLogoProps> = ({ handleLogoClick }) => {
  return (
    <a
      href="#home"
      onClick={handleLogoClick}
      className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap text-white m-[2px] my-auto hover:bg-[#17342C]/10 transition-colors w-auto"
    >
      <img 
        src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
        alt="Narra Icon" 
        className="h-4 w-4 sm:h-5 sm:w-5"
      />
    </a>
  );
};

export default NarraLogo;
