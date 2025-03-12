import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";
import { ChevronDown } from "lucide-react";
import { getPageContent } from "@/utils/bookPagination";

interface PageViewProps {
  story: Story;
  pageNumber: number; // 1-based page number within the story
  totalPagesInStory?: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
  isMobile?: boolean;
  globalPageNumber?: number; // Added to display the page number at the bottom
  bookTitle?: string; // Add book title prop
}

const PageView = ({ 
  story, 
  pageNumber, 
  totalPagesInStory = 1,
  isMediaPage = false,
  mediaItem,
  isMobile = false,
  globalPageNumber = 1,
  bookTitle = "My Book" // Default book title
}: PageViewProps) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
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

  const { data: mediaItems = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["story-media", story.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", story.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
      }

      return data as StoryMediaItem[];
    },
  });

  const pageContent = getPageContent(story, pageNumber);

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("story-media")
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  if (isMediaPage && mediaItem) {
    return (
      <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
        <div className="text-center italic text-green-800 font-serif pt-6 w-full">
          {bookTitle}
        </div>
        
        <div className="max-w-full max-h-[75%] flex justify-center items-center flex-1">
          {mediaItem.content_type.startsWith("image/") ? (
            <div className="max-h-full flex flex-col items-center">
              <div className="media-display">
                <img 
                  src={getPublicUrl(mediaItem.file_path)} 
                  alt={mediaItem.caption || "Image"} 
                  className="max-h-[60vh] max-w-full object-contain rounded-lg" 
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              {mediaItem.caption && (
                <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt] mx-auto max-w-[80%] no-indent">
                  {mediaItem.caption}
                </p>
              )}
            </div>
          ) : mediaItem.content_type.startsWith("video/") ? (
            <div className="media-display flex flex-col items-center">
              <video 
                src={getPublicUrl(mediaItem.file_path)} 
                controls 
                className="max-h-[60vh] max-w-full rounded-lg"
                onError={(e) => {
                  console.error("Error loading video:", e);
                  const target = e.target as HTMLVideoElement;
                  target.onerror = null;
                }}
              >
                Your browser does not support the video tag.
              </video>
              {mediaItem.caption && (
                <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt] mx-auto max-w-[80%] no-indent">
                  {mediaItem.caption}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded">
              Unsupported media type: {mediaItem.content_type}
            </div>
          )}
        </div>
        
        <div className="absolute bottom-8 w-full text-center">
          <span className="text-gray-700">{globalPageNumber}</span>
        </div>
      </div>
    );
  }

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
          <div className="bg-gradient-to-r from-[#fdfcfb] to-[#e2d1c3] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <span className="text-[#A33D29] text-sm font-serif mb-1">Scroll down to read more</span>
            <ChevronDown className="h-5 w-5 text-[#A33D29]" />
          </div>
        </div>
      )}
      
      <div className="w-full text-center pb-8">
        <span className="text-gray-700">{globalPageNumber}</span>
      </div>
    </div>
  );
};

export default PageView;
