
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

interface PageViewProps {
  story: Story;
  pageNumber: number; // 1-based page number within the story
  totalPagesInStory?: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
}

const PageView = ({ 
  story, 
  pageNumber, 
  totalPagesInStory = 1,
  isMediaPage = false,
  mediaItem
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

  // If this is a media page, only show the media item
  if (isMediaPage && mediaItem) {
    return (
      <div className="w-full h-full overflow-auto p-8 bg-white book-page flex flex-col items-center justify-center">
        <div className="max-w-full max-h-[80%] flex justify-center items-center">
          {mediaItem.content_type.startsWith("image/") ? (
            <div className="max-h-full">
              {/* Simplified display of image without edit functionality */}
              <div className="media-display">
                <img 
                  src={mediaItem.file_path} 
                  alt={mediaItem.caption || "Image"} 
                  className="max-h-[70vh] max-w-full object-contain rounded-lg" 
                />
              </div>
              {mediaItem.caption && (
                <p className="text-sm text-center italic mt-4">{mediaItem.caption}</p>
              )}
            </div>
          ) : mediaItem.content_type.startsWith("video/") ? (
            <div className="media-display">
              <video 
                src={mediaItem.file_path} 
                controls 
                className="max-h-[70vh] max-w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
              {mediaItem.caption && (
                <p className="text-sm text-center italic mt-4">{mediaItem.caption}</p>
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

  return (
    <div className="w-full h-full overflow-auto p-8 bg-white book-page">
      <div className="w-full mx-auto book-content">
        {/* Story Header - only on first page */}
        {pageNumber === 1 && (
          <div className="mb-6">
            <div className="flex justify-between items-baseline">
              <h2 className="text-2xl font-semibold">
                {story.title || "Untitled Story"}
              </h2>
              <span className="text-sm text-gray-500">
                {format(new Date(story.created_at), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="text-right text-sm text-gray-400">Page {pageNumber} of {totalPagesInStory}</div>
          </div>
        )}

        {/* Story Content */}
        <div className="prose max-w-none book-text">
          {pageContent.length > 0 ? (
            pageContent.map((paragraph, index) => (
              <p key={index} className="mb-4">
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
