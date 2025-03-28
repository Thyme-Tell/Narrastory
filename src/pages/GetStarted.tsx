
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, Book, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const isMobile = useIsMobile();
  
  const [activeStep, setActiveStep] = useState(0);
  
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
      icon: <Home className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 text-white" />
    },
    { 
      name: "how-it-works", 
      label: "How it Works", 
      path: "/how-it-works",
      icon: <Book className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 text-white" />
    },
    { 
      name: "join-story-circle", 
      label: "Join a Story Circle", 
      path: "/join-story-circle",
      icon: <Users className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 text-white" />
    },
    {
      name: "sign-up",
      label: "Sign Up",
      path: "/",
      icon: <ArrowRight className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 text-white" />,
      isButton: true
    }
  ];

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : howItWorksSteps.length - 1));
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev < howItWorksSteps.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-[#EFF1E9] px-[7%]">
      <header className="py-4 px-4 sm:px-8 bg-transparent sticky top-0 z-50">
        <nav className="flex flex-col sm:flex-row justify-between items-center bg-transparent py-1.5 sm:py-2">
          <Link 
            to="/get-started" 
            className="bg-[#EFF1E9]/50 backdrop-blur-sm rounded-[100px] p-4 inline-block"
          >
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
              alt="Narra Logo" 
              className="w-[130px] h-auto"
            />
          </Link>

          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-[#8A9096]/80 backdrop-blur-sm rounded-[2px] p-0.5 flex flex-col sm:flex-row items-center mb-4 sm:mb-0 w-full sm:w-auto shadow-sm">
              {navItems.map((item) => (
                item.isButton ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-[3px] text-xs sm:text-sm font-medium bg-atlantic text-white hover:bg-atlantic/90 transition-colors duration-200 w-full sm:w-auto justify-center m-[3px] my-auto`}
                  >
                    Sign Up <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </Link>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-[3px] text-xs sm:text-sm font-medium m-[3px] my-auto ${
                      activeItem === item.name
                        ? "bg-[#17342C] text-white"
                        : "text-white hover:bg-[#17342C]/10"
                    } transition-colors duration-200 w-full sm:w-auto mb-0.5 sm:mb-0 sm:mr-0.5`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </nav>
      </header>

      <div 
        className="w-full h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//beacon.png')",
          backgroundSize: "contain", 
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-[56px] font-caslon font-thin mb-6 leading-tight text-[#262626]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Narrate as only <em className="italic font-caslon font-thin">you</em> can.
          </h1>
          
          <h2 className="text-xl md:text-2xl lg:text-[30px] font-caslon mb-4 text-[#262626]">
            Share your life stories through simple conversation.
          </h2>
          
          <p 
            className="text-lg md:text-xl text-[#2F3546] mb-12 max-w-2xl mx-auto"
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
            <div className={`relative w-full ${isMobile ? 'flex flex-col' : ''}`}>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={inputFocused ? "" : "Your phone number"}
                className={`w-full h-12 bg-white/67 border border-[rgba(89,89,89,0.32)] rounded-full text-base ${
                  isMobile ? 'mb-2 pr-5 text-center' : 'pr-[150px]'
                } outline-none`}
                onFocus={() => setInputFocused(true)}
                onBlur={() => !phoneNumber && setInputFocused(false)}
              />
              <Button 
                className={`${isMobile ? 'w-full' : 'absolute right-1 top-1'} rounded-full h-10 text-white text-base flex items-center gap-2 font-light`}
                style={{
                  background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
                }}
                onClick={() => console.log("Talk with", phoneNumber)}
              >
                Talk with 
                <img 
                  src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
                  alt="Narra Icon" 
                  className="w-5 h-5 relative -top-[2px]"
                />
                <span className="font-light">Narra</span> 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-12 md:mb-16">
            How it Works
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="w-full md:w-1/3">
              <div className="flex flex-row md:flex-col gap-2 md:gap-4 relative">
                {/* Background vertical line */}
                <div className="hidden md:block absolute left-0 top-0 w-0.5 h-full bg-[rgba(47,53,70,0.13)]"></div>
                
                {/* Active indicator */}
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
                        className={`font-uncut-sans text-[0.7rem] md:text-base mb-1 transition-colors duration-300 font-normal ${
                          idx === activeStep
                            ? "text-[#242F3F]"
                            : "text-[#8A898C] group-hover:text-[#555555]"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {!isMobile && (
                        <p
                          className={`${step.descriptionStyle} font-uncut-sans transition-colors duration-300 ${
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

              <div className="flex justify-center mt-6 space-x-4 md:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevStep}
                  className="rounded-full border-[#C8C8C9] text-[#403E43]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextStep}
                  className="rounded-full border-[#C8C8C9] text-[#403E43]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <Card className="bg-white rounded-xl shadow-md overflow-hidden" style={{ minHeight: "700px" }}>
                <div className="flex flex-col h-full">
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-[1.6rem] md:text-[1.6rem] font-caslon font-thin mb-2 text-[#242F3F]">
                      {howItWorksSteps[activeStep].description}
                    </h3>
                    <p className="text-[#403E43] text-[14px]">
                      {howItWorksSteps[activeStep].content}
                    </p>
                  </div>
                  <div className="bg-[#F6F6F7] flex-grow">
                    <div className="h-full">
                      <img
                        src={howItWorksSteps[activeStep].image}
                        alt={howItWorksSteps[activeStep].title}
                        className="w-full h-full object-cover"
                        style={{ maxHeight: "600px" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="hidden md:flex justify-end mt-6 space-x-4">
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
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-caslon font-bold text-atlantic mb-6">
            Welcome to Narra
          </h2>
          <p className="text-lg md:text-xl text-[#262626] mb-8">
            Your place to create, share, and preserve your most important stories.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-2xl font-caslon font-bold text-atlantic mb-4">
              Get Started with Narra
            </h3>
            <p className="text-[#262626] mb-4">
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
