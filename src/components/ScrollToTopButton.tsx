
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolling down 500px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 rounded-full shadow-md bg-white hover:bg-gray-100 border-[#A33D29]/20 hover:border-[#A33D29]/50 z-50 transition-all duration-300 animate-fade-in gap-2"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 text-[#A33D29]" />
      <span className="text-[#A33D29]">Back to top</span>
    </Button>
  );
};

export default ScrollToTopButton;
