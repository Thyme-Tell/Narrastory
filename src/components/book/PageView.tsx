
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

interface PageViewProps {
  story: Story;
  pageNumber: number; // 1-based page number within the story
  totalPagesInStory?: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
  isMobile?: boolean;
}

const PageView = ({ 
  story, 
  pageNumber, 
  totalPagesInStory = 1,
  isMediaPage = false,
  mediaItem,
  isMobile = false
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

  // Get content for this page using our pagination utility
  const pageContent = getPageContent(story, pageNumber);

  // Helper function to get public URL for media items
  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("story-media")
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // If this is a media page, only show the media item
  if (isMediaPage && mediaItem) {
    return (
      <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
        <div className="max-w-full max-h-[75%] flex justify-center items-center">
          {mediaItem.content_type.startsWith("image/") ? (
            <div className="max-h-full">
              {/* Simplified display of image without edit functionality */}
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
                <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt]">{mediaItem.caption}</p>
              )}
            </div>
          ) : mediaItem.content_type.startsWith("video/") ? (
            <div className="media-display">
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
                <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt]">{mediaItem.caption}</p>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded">
              Unsupported media type: {mediaItem.content_type}
            </div>
          )}
        </div>
      </div>
    );
  }

  const titleFontSize = isMobile ? "text-lg" : "text-2xl";
  const contentFontSize = isMobile ? "text-sm" : "text-base";
  const paragraphSpacing = isMobile ? "mb-2" : "mb-4";

  return (
    <div className="w-full h-full bg-white book-page">
      <div className="w-full mx-auto book-content p-3 sm:p-6 overflow-y-auto" style={{ maxHeight: "100%" }}>
        {/* Story Header - only on first page */}
        {pageNumber === 1 && (
          <div className="mb-3 sm:mb-5">
            <div className="flex justify-between items-baseline flex-wrap">
              <h2 className={`${titleFontSize} font-semibold mb-1`}>
                {story.title || "Untitled Story"}
              </h2>
              <span className="text-xs text-gray-500">
                {format(new Date(story.created_at), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="text-right text-xs text-gray-400">Page {pageNumber} of {totalPagesInStory}</div>
          </div>
        )}

        {/* Story Content */}
        <div className={`prose max-w-none ${contentFontSize}`}>
          {pageContent.length > 0 ? (
            pageContent.map((paragraph, index) => (
              <p key={index} className={paragraphSpacing}>
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic">No content on this page</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageView;
