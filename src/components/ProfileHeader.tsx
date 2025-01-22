import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleLogout}>
            Not {firstName}? Log Out
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/">
              Sign Up for Narra
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileHeader;