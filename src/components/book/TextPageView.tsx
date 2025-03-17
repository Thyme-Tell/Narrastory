
import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { ChevronsDown } from "lucide-react";
import { getPageContent } from "@/utils/bookPagination";
import { Button } from "@/components/ui/button";
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
    
    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [story, pageNumber, hasScrolled]);

  const pageContent = getPageContent(story, pageNumber);
  const isFirstPage = pageNumber === 1;
  
  const progress = Math.round((globalPageNumber / totalPageCount) * 100);

  const renderParagraph = (text: string, index: number, isFirstParagraph: boolean) => {
    if (!text) return null;
    
    const shouldUseDropCap = isFirstParagraph && isFirstPage;
    let dropCapClass = '';
    
    if (shouldUseDropCap) {
      const firstChar = text.trim()[0]?.toLowerCase();
      if (firstChar === 'a') {
        dropCapClass = 'drop-cap a-dropcap';
      } else if (firstChar === 'b') {
        dropCapClass = 'drop-cap b-dropcap';
      } else {
        dropCapClass = 'drop-cap';
      }
    }
    
    return (
      <p 
        key={index} 
        className={`indent-6 text-[11pt] text-justify leading-relaxed tracking-normal ${dropCapClass}`}
        style={{ 
          fontFamily: '"Libre Caslon Text", Georgia, "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", Times, serif',
          color: '#383838'
        }}
      >
        {text}
      </p>
    );
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
        <div className="absolute bottom-16 left-0 right-0 flex justify-center fade-in pointer-events-none">
          <Button
            variant="outline"
            className="rounded-full shadow-md bg-white hover:bg-gray-100 border-[#A33D29]/20 hover:border-[#A33D29]/50 transition-all duration-300 animate-fade-in gap-2 pointer-events-none font-sans"
          >
            <span className="text-[#A33D29]">Scroll down to read more</span>
            <ChevronsDown className="h-5 w-5 text-[#A33D29]" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TextPageView;
