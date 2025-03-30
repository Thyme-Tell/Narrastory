
import React from "react";
import { Link } from "react-router-dom";

const LegalPageHeader: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-8 sticky top-0 z-50 transition-all backdrop-blur-md bg-[#EFF1E9]/70">
      <div className="flex justify-center sm:justify-start">
        <Link 
          to="/"
          className="bg-[#EFF1E9]/50 backdrop-blur-sm rounded-[100px] p-2 flex items-center"
          style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
        >
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
            alt="Narra Logo" 
            className="w-[130px] h-auto"
          />
        </Link>
      </div>
    </header>
  );
};

export default LegalPageHeader;
