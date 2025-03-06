
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
}

const PageView = ({ story, pageNumber, totalPagesInStory = 1 }: PageViewProps) => {
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
  
  // Show media only on the first page of a story
  const showMedia = pageNumber === 1;

  // Function to handle media item click
  const handleImageClick = (url: string) => {
    console.log("Image clicked:", url);
  };

  // Function to handle media caption update
  const handleCaptionUpdate = (mediaId: string, caption: string) => {
    console.log("Caption update:", mediaId, caption);
  };

  // Function to handle crop start
  const handleStartCrop = (url: string, mediaId: string) => {
    console.log("Start crop:", url, mediaId);
  };

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

        {/* Media Items - only on the first page */}
        {showMedia && (
          isMediaLoading ? (
            <Skeleton className="w-full h-40 mt-6" />
          ) : (
            mediaItems.length > 0 && (
              <div className="mt-8 space-y-4">
                {mediaItems.map((media) => (
                  <div key={media.id} className="border rounded-md p-2">
                    {media.content_type.startsWith("image/") ? (
                      <div className="flex justify-center">
                        <ImageMedia
                          media={{
                            id: media.id,
                            file_path: media.file_path,
                            file_name: media.file_name || "image",
                            caption: media.caption
                          }}
                          onImageClick={handleImageClick}
                          onStartCrop={handleStartCrop}
                          onCaptionUpdate={handleCaptionUpdate}
                        />
                      </div>
                    ) : media.content_type.startsWith("video/") ? (
                      <VideoMedia
                        media={{
                          id: media.id,
                          file_path: media.file_path,
                          content_type: media.content_type,
                          caption: media.caption
                        }}
                        onCaptionUpdate={handleCaptionUpdate}
                      />
                    ) : (
                      <div className="text-center p-4 bg-gray-100 rounded">
                        Unsupported media type: {media.content_type}
                      </div>
                    )}
                    {media.caption && (
                      <p className="text-sm text-center italic mt-2">{media.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default PageView;
