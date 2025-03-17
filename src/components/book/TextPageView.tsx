import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { ChevronsDown } from "lucide-react";
import { getPageContent } from "@/utils/bookPagination";
import { Progress } from "@/components/ui/progress";

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
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setHasScrolled(false);
  }, [globalPageNumber, story, pageNumber]);
  
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setShowScrollIndicator(isScrollable && !hasScrolled);
      }
    };

    const handleScroll = () => {
      if (contentRef.current) {
        if (contentRef.current.scrollTop > 20) {
          setHasScrolled(true);
        }
        
        const isAtBottom = contentRef.current.scrollHeight - contentRef.current.scrollTop <= contentRef.current.clientHeight + 10;
        
        if (contentRef.current.scrollTop > 20 || isAtBottom) {
          setShowScrollIndicator(false);
        }
      }
    };
    
    checkScrollable();
    const currentRef = contentRef.current;
    
    currentRef?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);
    
    // Set a timeout to hide the indicator after 5 seconds (3s display + 2s fade)
    let timeoutId: number | null = null;
    
    if (showScrollIndicator) {
      timeoutId = window.setTimeout(() => {
        setShowScrollIndicator(false);
      }, 5000);
    }
    
    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [story, pageNumber, hasScrolled, showScrollIndicator]);

  // Show the indicator after 3 seconds when page loads
  useEffect(() => {
    const indicatorDelay = window.setTimeout(() => {
      if (contentRef.current) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        if (isScrollable && !hasScrolled) {
          setShowScrollIndicator(true);
        }
      }
    }, 3000);
    
    return () => clearTimeout(indicatorDelay);
  }, [pageNumber, story, hasScrolled]);

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
            <h1 className="text-center font-normal font-[300] text-[24px] leading-[120%] text-[#262626] mt-4 mb-8" style={{ fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif' }}>
              {story.title || "Untitled Story"}
            </h1>
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
          <div className="chevron-vector vector-top"></div>
          <div className="chevron-vector vector-bottom"></div>
        </div>
      )}
    </div>
  );
};

export default TextPageView;
