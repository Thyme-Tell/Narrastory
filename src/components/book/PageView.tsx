import React from "react";
import { Story } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StoryMediaItem } from "@/types/media";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageContent } from "@/utils/bookPagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateQRCodeUrl } from "@/utils/qrCodeUtils";

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
    // Handle based on media type
    if (mediaItem.content_type.startsWith("image/")) {
      // For images, use the same display as before
      return (
        <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
          <div className="text-center italic text-green-800 font-serif pt-6 w-full">
            {bookTitle}
          </div>
          
          <div className="max-w-full max-h-[75%] flex justify-center items-center flex-1">
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
          </div>
          
          <div className="absolute bottom-8 w-full text-center">
            <span className="text-gray-700">{globalPageNumber}</span>
          </div>
        </div>
      );
    } else if (mediaItem.content_type.startsWith("video/")) {
      // For videos, use QR code + thumbnail layout
      const videoUrl = getPublicUrl(mediaItem.file_path);
      const qrCodeUrl = generateQRCodeUrl(videoUrl);
      
      return (
        <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
          <div className="text-center italic text-green-800 font-serif pt-6 w-full">
            {bookTitle}
          </div>
          
          <div className="max-w-full max-h-[75%] flex flex-col justify-center items-center flex-1 space-y-4">
            <div className="flex flex-col items-center">
              {/* Video Thumbnail */}
              <div className="relative mb-4">
                <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={`https://images.unsplash.com/photo-1518770660439-4636190af475`} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {mediaItem.caption && (
                  <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt] mx-auto max-w-[80%] no-indent">
                    {mediaItem.caption}
                  </p>
                )}
              </div>
              
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <p className="text-center mb-2 font-medium">Scan to watch video</p>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code to view video" 
                  className="w-32 h-32"
                />
                <p className="text-xs text-center mt-2 text-gray-500 break-all px-4">
                  {videoUrl}
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 w-full text-center">
            <span className="text-gray-700">{globalPageNumber}</span>
          </div>
        </div>
      );
    } else {
      // For unsupported media types
      return (
        <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
          <div className="text-center italic text-green-800 font-serif pt-6 w-full">
            {bookTitle}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 bg-gray-100 rounded-lg">
              <p className="text-lg font-medium text-gray-800">Unsupported Media</p>
              <p className="text-sm text-gray-600 mt-2">
                This content type ({mediaItem.content_type}) cannot be displayed in the book preview.
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-8 w-full text-center">
            <span className="text-gray-700">{globalPageNumber}</span>
          </div>
        </div>
      );
    }
  }

  // For regular text pages, keep the original rendering
  const isFirstPage = pageNumber === 1;

  return (
    <div className="w-full h-full bg-[#f5f5f0] book-page flex flex-col">
      <div className="text-center italic text-green-800 font-serif pt-6">
        {bookTitle}
      </div>
      
      <div className="flex-1 mx-auto book-content px-12 py-10 overflow-y-auto">
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
      
      <div className="w-full text-center pb-8">
        <span className="text-gray-700">{globalPageNumber}</span>
      </div>
    </div>
  );
};

export default PageView;
