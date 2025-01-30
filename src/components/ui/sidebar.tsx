import { Home, LogIn, User, Library } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const profileId = Cookies.get('profile_id');
  const isAuthorized = Cookies.get('profile_authorized');

  const handleStoryBooksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profileId || !isAuthorized) {
      navigate('/sign-in');
    } else {
      navigate('/storybooks');
    }
  };

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      to: "/",
    },
    {
      title: "Sign In",
      icon: LogIn,
      to: "/sign-in",
    },
    {
      title: "Profile",
      icon: User,
      to: "/profile",
    },
    {
      title: "Storybooks",
      icon: Library,
      onClick: handleStoryBooksClick,
      to: "#",
    },
  ];

  return (
    <ShadcnSidebar>
      <ShadcnSidebarContent>
        <ShadcnSidebarGroup>
          <ShadcnSidebarGroupContent>
            {menuItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.to}
                onClick={item.onClick}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </ShadcnSidebarGroupContent>
        </ShadcnSidebarGroup>
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}