
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
import { generateQRCodeUrl, generateShortVideoUrl } from "@/utils/qrCodeUtils";
import { getVideoThumbnail } from "@/components/VideoMedia";

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

  const { data: profileInfo } = useQuery({
    queryKey: ["profile-info", story.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", story.profile_id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const pageContent = getPageContent(story, pageNumber);

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("story-media")
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Common page wrapper with fixed dimensions and consistent styling
  const BookPageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="book-page-wrapper" style={{
      width: "100%",
      height: "100%",
      position: "relative",
      backgroundColor: "#f5f5f0",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Book title header */}
      <div className="text-center italic text-green-800 font-serif pt-4 pb-2">
        {bookTitle}
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden px-8">
        {children}
      </div>
      
      {/* Page number footer */}
      <div className="w-full text-center py-4">
        <span className="text-gray-700">{globalPageNumber}</span>
      </div>
    </div>
  );

  if (isMediaPage && mediaItem) {
    if (mediaItem.content_type.startsWith("image/")) {
      return (
        <BookPageWrapper>
          <div className="flex flex-col items-center justify-center h-full max-h-[75%]">
            <div className="max-h-full flex flex-col items-center">
              <div className="media-display">
                <img 
                  src={getPublicUrl(mediaItem.file_path)} 
                  alt={mediaItem.caption || "Image"} 
                  className="max-h-[380px] max-w-full object-contain rounded-lg" 
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
        </BookPageWrapper>
      );
    } else if (mediaItem.content_type.startsWith("video/")) {
      const videoUrl = getPublicUrl(mediaItem.file_path);
      
      const userName = profileInfo ? 
        `${profileInfo.first_name}-${profileInfo.last_name}` : 
        `user-${mediaItem.id.substring(0, 6)}`;
      
      const shortUrl = generateShortVideoUrl(
        profileInfo?.id || "", 
        userName, 
        mediaItem.id
      );
      
      const qrCodeUrl = generateQRCodeUrl(shortUrl);
      const thumbnailUrl = getVideoThumbnail(mediaItem.id);
      
      return (
        <BookPageWrapper>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={thumbnailUrl}
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
                  <p className="text-sm text-center italic mt-2 text-gray-500 text-[11pt] mx-auto max-w-[80%] no-indent">
                    {mediaItem.caption}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-center mb-2 font-medium">Scan to watch video</p>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code to view video" 
                  className="w-32 h-32"
                  onError={(e) => {
                    console.error("QR code loading error:", e);
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(shortUrl);
                  }}
                />
                <p className="text-xs text-center mt-2 text-gray-500 max-w-[90%]">
                  {shortUrl}
                </p>
              </div>
            </div>
          </div>
        </BookPageWrapper>
      );
    } else {
      return (
        <BookPageWrapper>
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-gray-100 rounded-lg">
              <p className="text-lg font-medium text-gray-800">Unsupported Media</p>
              <p className="text-sm text-gray-600 mt-2">
                This content type ({mediaItem.content_type}) cannot be displayed in the book preview.
              </p>
            </div>
          </div>
        </BookPageWrapper>
      );
    }
  }

  const isFirstPage = pageNumber === 1;

  return (
    <BookPageWrapper>
      <div className="h-full overflow-y-auto book-content pb-4">
        <div className="prose max-w-none font-serif text-[11pt]">
          {isFirstPage && (
            <h1 className="text-center font-serif text-[16pt] mb-6 font-bold">
              {story.title || "Untitled Story"}
            </h1>
          )}
          
          {pageContent.length > 0 ? (
            <div className="story-content">
              {pageContent.map((paragraph, index) => (
                <p key={index} className="indent-8 text-[11pt] text-justify mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-[11pt]">No content on this page</p>
          )}
        </div>
      </div>
    </BookPageWrapper>
  );
};

export default PageView;
