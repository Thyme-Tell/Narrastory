
import React, { useState, useEffect } from "react";
import { Story } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StoryMediaItem } from "@/types/media";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
import { Skeleton } from "@/components/ui/skeleton";

interface PageViewProps {
  story: Story;
  pageNumber: number;
}

const PageView = ({ story, pageNumber }: PageViewProps) => {
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

  // Split story content into paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="w-full h-full overflow-auto p-8 bg-white">
      <div className="w-full max-w-4xl mx-auto">
        {/* Story Header */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-2xl font-semibold">
              {story.title || "Untitled Story"}
            </h2>
            <span className="text-sm text-gray-500">
              {format(new Date(story.created_at), "MMMM d, yyyy")}
            </span>
          </div>
          <div className="text-right text-sm text-gray-400">Page {pageNumber}</div>
        </div>

        {/* Story Content */}
        <div className="prose max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Media Items */}
        {isMediaLoading ? (
          <Skeleton className="w-full h-40 mt-6" />
        ) : (
          mediaItems.length > 0 && (
            <div className="mt-8 space-y-4">
              {mediaItems.map((media) => (
                <div key={media.id} className="border rounded-md p-2">
                  {media.content_type.startsWith("image/") ? (
                    <div className="flex justify-center">
                      <ImageMedia url={media.file_path} alt={media.caption || "Story image"} />
                    </div>
                  ) : media.content_type.startsWith("video/") ? (
                    <VideoMedia url={media.file_path} />
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
        )}
      </div>
    </div>
  );
};

export default PageView;
