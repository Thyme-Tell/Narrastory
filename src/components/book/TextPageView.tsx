
import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { ChevronsDown } from "lucide-react";
import { getPageContent } from "@/utils/bookPagination";

interface TextPageViewProps {
  story: Story;
  pageNumber: number;
  globalPageNumber: number;
  bookTitle: string;
}

const TextPageView = ({ 
  story, 
  pageNumber, 
  globalPageNumber, 
  bookTitle 
}: TextPageViewProps) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Reset hasScrolled state when the page changes
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
      if (contentRef.current && contentRef.current.scrollTop > 20) {
        setHasScrolled(true);
        setShowScrollIndicator(false);
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

  return (
    <div className="w-full h-full bg-[#f5f5f0] book-page flex flex-col relative">
      <div className="text-center italic text-green-800 font-serif pt-6">
        {bookTitle}
      </div>
      
      <div 
        ref={contentRef}
        className="flex-1 mx-auto book-content px-12 py-8 overflow-y-auto"
      >
        <div className="prose max-w-none font-serif text-[11pt]">
          {isFirstPage && (
            <h1 className="text-center font-serif text-[16pt] mb-6 font-bold">
              {story.title || "Untitled Story"}
            </h1>
          )}
          
          {pageContent.length > 0 ? (
            pageContent.map((paragraph, index) => (
              <p key={index} className="indent-8 text-[11pt] text-justify">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic text-[11pt]">No content on this page</p>
          )}
        </div>
      </div>
      
      {showScrollIndicator && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center fade-in pointer-events-none">
          <div className="bg-white py-3 px-6 rounded-full shadow-lg flex items-center space-x-2 scale-70">
            <span className="text-[#A33D29] text-base font-serif">Scroll down to read more</span>
            <ChevronsDown className="h-5 w-5 text-[#A33D29]" />
          </div>
        </div>
      )}
      
      <div className="w-full text-center pb-8">
        <span className="text-gray-700">{globalPageNumber}</span>
      </div>
    </div>
  );
};

export default TextPageView;
