
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  
  useEffect(() => {
    document.title = "Narra Story | Get Started";
    
    // Set active nav item based on path
    const path = location.pathname;
    if (path === "/get-started") setActiveItem("home");
    if (path === "/how-it-works") setActiveItem("how-it-works");
    if (path === "/join-story-circle") setActiveItem("join-story-circle");
    if (path === "/sign-up" || path === "/") setActiveItem("sign-up");
  }, [location]);

  const navItems = [
    { 
      name: "home", 
      label: "Home", 
      path: "/get-started",
      icon: <Home className="mr-2 h-4 w-4" />
    },
    { 
      name: "how-it-works", 
      label: "How it Works", 
      path: "/how-it-works",
      icon: <Info className="mr-2 h-4 w-4" />
    },
    { 
      name: "join-story-circle", 
      label: "Join a Story Circle", 
      path: "/join-story-circle",
      icon: <Users className="mr-2 h-4 w-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      {/* Navbar */}
      <nav className="py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <Link to="/get-started">
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
            alt="Narra Logo" 
            className="w-[220px] h-auto mb-4 md:mb-0"
          />
        </Link>

        {/* Navigation items */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="bg-[#8A9096] rounded-lg p-1 flex flex-col md:flex-row items-center mb-4 md:mb-0 md:mr-4 w-full md:w-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  activeItem === item.name
                    ? "bg-[#17342C] text-white"
                    : "text-gray-800 hover:bg-[#17342C]/10"
                } transition-colors duration-200 w-full md:w-auto mb-1 md:mb-0 md:mr-1`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Sign Up Button */}
          <Link
            to="/"
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium bg-atlantic text-white hover:bg-atlantic/90 transition-colors duration-200 w-full md:w-auto justify-center`}
          >
            Sign Up <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="w-full py-16 md:py-24 px-4 flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//beacon.png')",
          minHeight: "50vh", // Changed from 90vh to 50vh
          maxHeight: "50vh", // Changed from 90vh to 50vh
          height: "50vh"     // Changed from 90vh to 50vh
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
            Narrate as only <em className="italic font-serif">you</em> can.
          </h1>
          
          <h2 className="text-xl md:text-2xl font-serif mb-4">
            Share your life stories through simple conversation.
          </h2>
          
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Narra transforms your everyday chats into meaningful and lasting stories that capture your essence.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-2 bg-white/90 rounded-full max-w-xl mx-auto">
            <input
              type="text"
              placeholder="What's your phone number?"
              className="px-6 py-3 w-full md:w-auto rounded-full bg-transparent outline-none"
            />
            <Button className="w-full md:w-auto rounded-full bg-[#242F3F] hover:bg-[#242F3F]/90 px-6">
              Try a call with <span className="font-bold">Narra</span> <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-atlantic mb-6">
            Welcome to Narra
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Your place to create, share, and preserve your most important stories.
          </p>
          
          {/* Content Placeholder - to be filled with actual content */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-2xl font-serif font-bold text-atlantic mb-4">
              Get Started with Narra
            </h3>
            <p className="text-gray-700 mb-4">
              Narra helps you create beautiful storybooks from your personal memories and experiences.
              Our intuitive tools make it easy to write, illustrate, and share your stories with loved ones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
