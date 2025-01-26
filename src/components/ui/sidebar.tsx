import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function AppSidebar() {
  const menuItems = [
    {
      title: "Home",
      icon: HomeIcon,
      to: "/",
    },
    {
      title: "Sign In",
      icon: SignInIcon,
      to: "/signin",
    },
    {
      title: "Profile",
      icon: UserIcon,
      to: "/profile",
    },
    {
      title: "Storybooks",
      icon: BookOpen,
      to: "/storybooks",
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {menuItems.map((item) => (
              <Link key={item.title} to={item.to}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
