import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { Progress } from "@/components/ui/progress";
import { getPageContent } from "@/utils/bookPagination";

interface TextPageViewProps {
  story: Story;
  pageNumber: number;
  globalPageNumber: number;
  bookTitle: string;
  totalPageCount?: number;
}

const TextPageView = ({ 
  story, 
  pageNumber, 
  globalPageNumber, 
  bookTitle,
  totalPageCount = 100 // Default to 100 if not provided
}: TextPageViewProps) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [indicatorShown, setIndicatorShown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setHasScrolled(false);
    setIndicatorShown(false); // Reset indicator shown state when page changes
  }, [globalPageNumber, story, pageNumber]);
  
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        // Only show the indicator if the content is scrollable, hasn't been scrolled, and hasn't been shown yet
        setShowScrollIndicator(isScrollable && !hasScrolled && !indicatorShown);
      }
    };

    const handleScroll = () => {
      if (contentRef.current) {
        if (contentRef.current.scrollTop > 20) {
          setHasScrolled(true);
          setShowScrollIndicator(false);
        }
      }
    };
    
    checkScrollable();
    const currentRef = contentRef.current;
    
    currentRef?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);
    
    // Set a timeout to hide the indicator after 3 seconds
    if (showScrollIndicator) {
      setIndicatorShown(true); // Mark that the indicator has been shown
      const timeoutId = window.setTimeout(() => {
        setShowScrollIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [story, pageNumber, hasScrolled, showScrollIndicator, indicatorShown]);

  // Show indicator on initial load if content is scrollable
  useEffect(() => {
    const indicatorDelay = window.setTimeout(() => {
      if (contentRef.current && !indicatorShown) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        if (isScrollable && !hasScrolled) {
          setShowScrollIndicator(true);
        }
      }
    }, 500); // Shorter delay for initial check
    
    return () => clearTimeout(indicatorDelay);
  }, [pageNumber, story, hasScrolled, indicatorShown]);

  const pageContent = getPageContent(story, pageNumber);
  const isFirstPage = pageNumber === 1;
  
  const progress = Math.round((globalPageNumber / totalPageCount) * 100);

  const renderParagraph = (text: string, index: number, isFirstParagraph: boolean) => {
    if (!text) return null;
    
    const shouldUseDropCap = isFirstParagraph && isFirstPage;
    
    if (shouldUseDropCap) {
      // For drop cap paragraphs, we'll handle the first word specially
      const words = text.split(' ');
      const firstWord = words[0];
      const restOfText = words.slice(1).join(' ');
      
      return (
        <p 
          key={index} 
          className="indent-6 text-[11pt] text-justify leading-relaxed tracking-normal drop-cap"
          style={{ 
            fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif',
            color: '#383838'
          }}
        >
          {firstWord}<span> </span>{restOfText}
        </p>
      );
    } else {
      // Regular paragraph without drop cap
      return (
        <p 
          key={index} 
          className="indent-6 text-[11pt] text-justify leading-relaxed tracking-normal"
          style={{ 
            fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif',
            color: '#383838'
          }}
        >
          {text}
        </p>
      );
    }
  };

  return (
    <div 
      className="w-full h-full book-page flex flex-col relative book-page-background"
      style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}
    >
      <div className="flex justify-between items-center px-4 pt-4 pb-1 relative">
        <div className="text-[#383838] text-[11pt]" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>
          {bookTitle}
        </div>
        <div className="text-[#383838] text-[11pt]" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>
          {globalPageNumber}/{totalPageCount}
        </div>
      </div>
      
      <div className="px-4 pb-2 relative">
        <Progress 
          value={progress} 
          className="h-[2px] w-full bg-[#242627]/[0.19] rounded-full" 
        />
      </div>
      
      <div 
        ref={contentRef}
        className="flex-1 mx-auto book-content px-[15px] py-4 overflow-y-auto"
      >
        <div className="prose max-w-none text-[11pt] leading-relaxed" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>
          {isFirstPage && (
            <>
              <h1 className="text-center font-normal font-[300] text-[24px] leading-[120%] text-[#262626] mt-4 mb-0" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>
                {story.title || "Untitled Story"}
              </h1>
              <img 
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//divider.svg"
                alt="Divider"
                className="title-divider"
              />
            </>
          )}
          
          {pageContent.length > 0 ? (
            pageContent.map((paragraph, index) => renderParagraph(paragraph, index, index === 0))
          ) : (
            <p className="text-gray-400 italic text-[11pt]" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>No content on this page</p>
          )}
        </div>
      </div>
      
      {showScrollIndicator && (
        <div className="scroll-indicator-container">
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//down.svg" 
            alt="Scroll down" 
            className="scroll-down-icon"
          />
        </div>
      )}
    </div>
  );
};

export default TextPageView;
