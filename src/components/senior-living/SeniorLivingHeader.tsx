
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionRefs {
  hero: React.RefObject<HTMLDivElement>;
  painPoints: React.RefObject<HTMLElement>;
  solution: React.RefObject<HTMLElement>;
  benefits: React.RefObject<HTMLElement>;
  features: React.RefObject<HTMLElement>;
  demo: React.RefObject<HTMLElement>;
}

interface SeniorLivingHeaderProps {
  refs: SectionRefs;
}

const SeniorLivingHeader: React.FC<SeniorLivingHeaderProps> = ({ refs }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrolled(position > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
              alt="Narra Logo" 
              className="h-10 w-auto"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection(refs.hero)} 
            className={`text-[#242F3F] hover:text-[#A33D29] transition-colors ${scrolled ? 'py-2' : 'py-1'}`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection(refs.painPoints)} 
            className={`text-[#242F3F] hover:text-[#A33D29] transition-colors ${scrolled ? 'py-2' : 'py-1'}`}
          >
            Challenges
          </button>
          <button 
            onClick={() => scrollToSection(refs.solution)} 
            className={`text-[#242F3F] hover:text-[#A33D29] transition-colors ${scrolled ? 'py-2' : 'py-1'}`}
          >
            Solution
          </button>
          <button 
            onClick={() => scrollToSection(refs.benefits)} 
            className={`text-[#242F3F] hover:text-[#A33D29] transition-colors ${scrolled ? 'py-2' : 'py-1'}`}
          >
            Benefits
          </button>
          <button 
            onClick={() => scrollToSection(refs.features)} 
            className={`text-[#242F3F] hover:text-[#A33D29] transition-colors ${scrolled ? 'py-2' : 'py-1'}`}
          >
            Features
          </button>
          <Button 
            onClick={() => scrollToSection(refs.demo)} 
            className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white rounded-full"
          >
            Book a Demo
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-[#242F3F]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col pt-20">
          <div className="absolute top-4 right-4">
            <button 
              className="p-2 text-[#242F3F]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <nav className="flex flex-col space-y-4">
            <button 
              onClick={() => scrollToSection(refs.hero)} 
              className="py-3 px-4 text-left text-lg text-[#242F3F] hover:bg-[#EFF1E9] rounded-md"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection(refs.painPoints)} 
              className="py-3 px-4 text-left text-lg text-[#242F3F] hover:bg-[#EFF1E9] rounded-md"
            >
              Challenges
            </button>
            <button 
              onClick={() => scrollToSection(refs.solution)} 
              className="py-3 px-4 text-left text-lg text-[#242F3F] hover:bg-[#EFF1E9] rounded-md"
            >
              Solution
            </button>
            <button 
              onClick={() => scrollToSection(refs.benefits)} 
              className="py-3 px-4 text-left text-lg text-[#242F3F] hover:bg-[#EFF1E9] rounded-md"
            >
              Benefits
            </button>
            <button 
              onClick={() => scrollToSection(refs.features)} 
              className="py-3 px-4 text-left text-lg text-[#242F3F] hover:bg-[#EFF1E9] rounded-md"
            >
              Features
            </button>
            <Button 
              onClick={() => scrollToSection(refs.demo)} 
              className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white rounded-full mt-4"
            >
              Book a Demo
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SeniorLivingHeader;
