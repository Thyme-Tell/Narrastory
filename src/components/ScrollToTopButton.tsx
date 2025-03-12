
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Check if the scroll position is past the threshold (500px)
  const checkScrollPosition = () => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Handle the scroll to top action
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    // Add scroll event listener when component mounts
    window.addEventListener("scroll", checkScrollPosition);
    
    // Check initial scroll position
    checkScrollPosition();
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  // Only render the button if it should be visible
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
