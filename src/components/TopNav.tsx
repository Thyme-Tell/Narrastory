import { Link } from "react-router-dom";

const TopNav = () => {
  return (
    <div className="w-full bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
            alt="Narra Logo"
            className="h-11"
          />
        </Link>
      </div>
    </div>
  );
};

export default TopNav;