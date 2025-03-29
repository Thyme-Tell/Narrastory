import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, Book, Users, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import CallNarraForm from "@/components/CallNarraForm";
import ProfileForm from "@/components/ProfileForm";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isMobile = useIsMobile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [activeStep, setActiveStep] = useState(0);
  
  const homeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const storyCirclesRef = useRef<HTMLElement>(null);
  const signUpRef = useRef<HTMLElement>(null);
  
  const howItWorksSteps = [
    {
      id: 0,
      title: "Talk with Narra",
      description: "Call Narra and chat casually.",
      content: "Narra, an AI-powered interviewer, will ask thoughtful questions to help you tell your story in your own words.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//call-narra%20(1).jpg",
      descriptionStyle: "text-[12px]"
    },
    {
      id: 1,
      title: "Receive Your Story",
      description: "Receive your story through text.",
      content: "In about a minute, you'll be able to read your story, written in your authentic voice.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//story%20(1).jpg",
      descriptionStyle: "text-[12px]"
    },
    {
      id: 2,
      title: "Order Your Book",
      description: "Order your beautiful book.",
      content: "Once you have enough content, give your book a quick read and get a beautifully designed copy in your hands.",
      image: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//book(2).jpg",
      descriptionStyle: "text-[12px]"
    }
  ];
  
  useEffect(() => {
    document.title = "Narra Story | Get Started";
    
    const path = location.pathname;
    const hash = location.hash;

    if (path === "/get-started" && !hash) setActiveItem("home");
    if (hash === "#how-it-works") setActiveItem("how-it-works");
    if (hash === "#join-story-circle") setActiveItem("join-story-circle");
    if (hash === "#sign-up") setActiveItem("sign-up");
  }, [location]);

  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  type NavItem = {
    name: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    ref: React.RefObject<HTMLElement | HTMLDivElement> | null;
    isButton?: boolean;
  };

  const navItems: NavItem[] = [
    { 
      name: "home", 
      label: "Home", 
      path: "/get-started",
      icon: <Home className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
      ref: homeRef
    },
    { 
      name: "how-it-works", 
      label: "How It Works", 
      path: "/get-started#how-it-works",
      icon: <Book className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
      ref: howItWorksRef
    },
    { 
      name: "join-story-circle", 
      label: "Join a Story Circle", 
      path: "/get-started#join-story-circle",
      icon: <Users className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
      ref: storyCirclesRef
    },
    {
      name: "sign-up",
      label: "Sign Up",
      path: "/get-started#sign-up",
      icon: <ArrowRight className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
      ref: signUpRef,
      isButton: true
    }
  ];

  const handleMenuItemClick = (item: NavItem) => {
    setIsDropdownOpen(false);
    setActiveItem(item.name);
    
    if (item.ref && item.ref.current) {
      item.ref.current.scrollIntoView({ behavior: 'smooth' });
    } else if (item.name === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeNavItem = navItems.find(item => item.name === activeItem) || navItems[0];

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : howItWorksSteps.length - 1));
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev < howItWorksSteps.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-[#EFF1E9] px-[7%]">
      <header className="py-4 px-4 sm:px-8 bg-transparent sticky top-0 z-50">
        <nav className="flex flex-col justify-between items-center bg-transparent py-1.5 sm:py-2 navbar-below-logo">
          <Link 
            to="/get-started" 
            className="bg-[#EFF1E9]/50 backdrop-blur-sm rounded-[100px] p-4 inline-block w-full sm:w-auto flex justify-center"
          >
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
              alt="Narra Logo" 
              className="w-[130px] h-auto"
            />
          </Link>

          <div className="flex w-full justify-center mt-4 navbar-menu">
            <div className="hidden sm:flex bg-[#8A9096]/80 backdrop-blur-sm rounded-[2px] p-0.5 items-center mx-auto shadow-sm whitespace-nowrap overflow-x-auto" 
              style={{ padding: "5px 2px" }}>
              {navItems.map((item) => (
                item.isButton ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuItemClick(item);
                    }}
                    className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-[3px] text-sm font-medium whitespace-nowrap bg-atlantic text-white hover:bg-atlantic/90 transition-colors duration-200 w-full sm:w-auto justify-center m-[3px] mr-[5px] my-auto`}
                  >
                    Sign Up <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 text-white" />
                  </Link>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuItemClick(item);
                    }}
                    className={`flex items-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-[3px] text-sm font-medium whitespace-nowrap text-white m-[3px] my-auto ${
                      activeItem === item.name
                        ? "bg-[#17342C]"
                        : "hover:bg-[#17342C]/10"
                    } transition-colors duration-200 w-full sm:w-auto mb-0 sm:mb-0 sm:mr-0.5`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              ))}
            </div>

            <div className="sm:hidden w-full max-w-[200px] mx-auto">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-2 bg-[#17342C] rounded-[2px] text-white">
                    <div className="flex items-center">
                      {activeNavItem.icon}
                      <span className="ml-2">{activeNavItem.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px] bg-[#8A9096]/80 backdrop-blur-sm border-0 text-white">
                  {navItems.map((item) => (
                    item.isButton ? (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuItemClick(item);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium bg-atlantic hover:bg-atlantic/90 text-white mr-[5px]"
                      >
                        {item.icon}
                        <span className="ml-2">Sign Up</span>
                        <ArrowRight className="ml-auto h-4 w-4 text-white" />
                      </Link>
                    ) : (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick(item);
                          }}
                          className={`flex items-center w-full px-4 py-2 text-white ${
                            activeItem === item.name
                              ? "bg-[#17342C]"
                              : "hover:bg-[#17342C]/30"
                          }`}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>

      <div 
        ref={homeRef}
        id="home"
        className="w-full h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//beacon.png')",
          backgroundSize: "contain", 
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-caslon font-thin mb-6 leading-tight text-[#262626]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Narrate as only <em className="italic font-caslon font-thin">you</em> can.
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-caslon mb-4 text-[#262626]">
            Share your life stories through simple conversation.
          </h2>
          
          <p 
            className="text-base md:text-lg text-[#2F3546] mb-12 max-w-2xl mx-auto"
            style={{ 
              fontFamily: "'Uncut Sans Variable', sans-serif", 
              fontStyle: 'normal', 
              fontWeight: 400, 
              opacity: 0.8 
            }}
          >
            Narra transforms your everyday chats into meaningful and lasting stories that capture your essence.
          </p>
          
          <div className="max-w-md mx-auto px-4">
            <CallNarraForm mobileLayout={isMobile} />
          </div>
        </div>
      </div>

      <section 
        ref={howItWorksRef}
        id="how-it-works"
        className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-12 md:mb-16">
            How it Works
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="w-full md:w-1/3">
              <div className="flex flex-row md:flex-col gap-2 md:gap-4 relative">
                <div className="hidden md:block absolute left-0 top-0 w-0.5 h-full bg-[rgba(47,53,70,0.13)]"></div>
                
                <div 
                  className="hidden md:block absolute left-0 w-0.5 bg-[#2F3546] transition-all duration-300"
                  style={{ 
                    top: `${activeStep * (100 / howItWorksSteps.length) + 9}%`,
                    height: '17px'
                  }}
                ></div>
                
                {howItWorksSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`relative cursor-pointer group ${
                      isMobile ? "flex-1" : ""
                    }`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div
                      className={`relative pl-4 py-3 transition-all duration-300 md:border-l-0 ${
                        idx === activeStep
                          ? "border-l-4 border-[#242F3F] md:border-l-0"
                          : "border-l-4 border-[#C8C8C9] md:border-l-0 group-hover:border-[#555555] md:group-hover:border-l-0"
                      }`}
                    >
                      <h3
                        className={`font-uncut-sans text-sm md:text-base mb-1 transition-colors duration-300 font-normal ${
                          idx === activeStep
                            ? "text-[#242F3F]"
                            : "text-[#8A898C] group-hover:text-[#555555]"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {!isMobile && (
                        <p
                          className={`text-xs md:text-sm font-uncut-sans transition-colors duration-300 ${
                            idx === activeStep
                              ? "text-[#403E43]"
                              : "text-[#9F9EA1] group-hover:text-[#555555]"
                          }`}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:flex justify-start mt-6 space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevStep}
                  className="rounded-full border-[#C8C8C9] text-[#403E43] hover:bg-[#F6F6F7] hover:text-[#242F3F]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextStep}
                  className="rounded-full border-[#C8C8C9] text-[#403E43] hover:bg-[#F6F6F7] hover:text-[#242F3F]"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <Card className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-caslon font-thin mb-2 text-[#242F3F]">
                      {howItWorksSteps[activeStep].description}
                    </h3>
                    <p className="text-sm md:text-base text-[#403E43]">
                      {howItWorksSteps[activeStep].content}
                    </p>
                  </div>
                  <div className="bg-[#F6F6F7] flex-grow">
                    <div>
                      <img
                        src={howItWorksSteps[activeStep].image}
                        alt={howItWorksSteps[activeStep].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={storyCirclesRef}
        id="join-story-circle"
        className="container mx-auto px-4 py-16 md:py-24 bg-white scroll-mt-24"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-12">
            Narra Story Circles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#EFF1E9] rounded-xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F]">
                Join a Circle
              </h3>
              <p className="text-sm md:text-base text-[#403E43] mb-6">
                Connect with others who share your interests and experiences. Story Circles offer a supportive environment to share memories and create collective narratives.
              </p>
              <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
                Find a Circle
              </Button>
            </div>
            
            <div className="bg-[#EFF1E9] rounded-xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F]">
                Create a Circle
              </h3>
              <p className="text-sm md:text-base text-[#403E43] mb-6">
                Start your own Story Circle with family, friends, or colleagues. Customize topics and invite participants to build a shared story collection.
              </p>
              <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
                Start a Circle
              </Button>
            </div>
          </div>
          
          <div className="mt-12 md:mt-16 bg-[#F6F6F7] rounded-xl p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F] text-center">
              Why Join a Story Circle?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#242F3F]" />
                </div>
                <h4 className="font-medium text-[#242F3F] mb-2">Community</h4>
                <p className="text-sm text-[#403E43]">Connect with others who share your experiences and interests</p>
              </div>
              <div className="text-center">
                <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Book className="h-8 w-8 text-[#242F3F]" />
                </div>
                <h4 className="font-medium text-[#242F3F] mb-2">Preservation</h4>
                <p className="text-sm text-[#403E43]">Create a lasting record of shared stories and memories</p>
              </div>
              <div className="text-center">
                <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-[#242F3F]" />
                </div>
                <h4 className="font-medium text-[#242F3F] mb-2">Growth</h4>
                <p className="text-sm text-[#403E43]">Discover new perspectives and deepen your own storytelling</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section 
        ref={signUpRef}
        id="sign-up"
        className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 text-center">
            Sign Up for Narra
          </h2>
          <p className="text-base md:text-lg text-[#403E43] mb-12 text-center max-w-2xl mx-auto">
            Join Narra today and start preserving your most important stories. Create a free account to begin your storytelling journey.
          </p>
          
          <div className="bg-white rounded-xl shadow-md p-8 md:p-10 max-w-md mx-auto">
            <ProfileForm />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-caslon font-bold text-atlantic mb-6">
            Welcome to Narra
          </h2>
          <p className="text-base md:text-lg text-[#262626] mb-8">
            Your place to create, share, and preserve your most important stories.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl md:text-2xl font-caslon font-bold text-atlantic mb-4">
              Get Started with Narra
            </h3>
            <p className="text-sm md:text-base text-[#262626] mb-4">
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
