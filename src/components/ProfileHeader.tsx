import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Remove the authorization cookie
    Cookies.remove('profile_authorized');
    // Navigate back to home
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="font-rosemartin text-atlantic text-2xl leading-[108.7%] tracking-[0.08em]">
        {firstName} {lastName}
      </h1>
      <div className="space-x-4">
        <button 
          onClick={handleLogout}
          className="text-primary hover:underline"
        >
          Not {firstName}? Log Out
        </button>
        <Link 
          to="/" 
          className="text-primary hover:underline"
        >
          Sign Up for Narra
        </Link>
      </div>
    </div>
  );
};

export default ProfileHeader;