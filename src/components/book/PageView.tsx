
import React, { useEffect, useRef, useState } from "react";
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
  isLastPage?: boolean;
}

const PageView = ({ story, pageNumber, isLastPage = false }: PageViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [pageCapacity, setPageCapacity] = useState(0);
  const [contentOverflows, setContentOverflows] = useState(false);

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

  // Parse story content into paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  
  // Calculate content for this specific page
  // Standard 5x8 book page can fit around 250-300 words (roughly 1500-2000 characters)
  const CHARS_PER_PAGE = 1800; // Slightly conservative estimate
  const startIndex = (pageNumber - 1) * CHARS_PER_PAGE;
  
  let currentCharCount = 0;
  let pageParas: string[] = [];
  
  // First page includes title and date
  if (pageNumber === 1) {
    // We need to account for the title and date space
    const titleSpace = 150; // Approximate character equivalent of space taken by title and date
    
    for (const para of paragraphs) {
      if (currentCharCount + para.length <= CHARS_PER_PAGE - titleSpace) {
        pageParas.push(para);
        currentCharCount += para.length;
      } else {
        break;
      }
    }
  } else {
    // For subsequent pages, continue from where we left off
    let skippedChars = 0;
    for (const para of paragraphs) {
      if (skippedChars < startIndex) {
        skippedChars += para.length;
        continue;
      }
      
      if (currentCharCount + para.length <= CHARS_PER_PAGE) {
        pageParas.push(para);
        currentCharCount += para.length;
      } else {
        // Check if we can include part of this paragraph
        if (currentCharCount < CHARS_PER_PAGE) {
          const remainingSpace = CHARS_PER_PAGE - currentCharCount;
          const partialPara = para.substring(0, remainingSpace);
          pageParas.push(partialPara + "...");
        }
        break;
      }
    }
  }

  // Check if we need to show media (only on first page)
  const showMedia = pageNumber === 1;

  // After component mounts, measure the actual content height
  useEffect(() => {
    if (contentRef.current) {
      // Get the content height
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      
      // Get the available page height (accounting for padding)
      // For a 5x8 inch book at standard DPI, height is about 768px (8 inches * 96dpi)
      const pageHeight = 768 - 64; // 64px for padding (32px top + 32px bottom)
      setPageCapacity(pageHeight);
      
      // Determine if content overflows
      setContentOverflows(height > pageHeight);
    }
  }, [pageParas, mediaItems, pageNumber]);

  // Handlers for media operations
  const handleImageClick = (url: string) => {
    console.log("Image clicked:", url);
  };

  const handleCaptionUpdate = (mediaId: string, caption: string) => {
    console.log("Caption update:", mediaId, caption);
  };

  const handleStartCrop = (url: string, mediaId: string) => {
    console.log("Start crop:", url, mediaId);
  };

  return (
    <div className="w-full h-full book-page flex flex-col p-8 bg-white">
      <div 
        ref={contentRef}
        className="w-full mx-auto book-content flex-1"
      >
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
            <div className="text-right text-sm text-gray-400">Page {pageNumber}</div>
          </div>
        )}

        <div className="prose max-w-none book-text">
          {pageParas.map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
          
          {/* If content overflows to next page, show indicator */}
          {contentOverflows && !isLastPage && (
            <div className="text-right text-sm text-gray-400 mt-4">
              Continued on next page...
            </div>
          )}
        </div>

        {showMedia && (
          isMediaLoading ? (
            <Skeleton className="w-full h-40 mt-6" />
          ) : (
            mediaItems.length > 0 && (
              <div className="mt-8 space-y-4">
                {mediaItems.slice(0, 1).map((media) => (
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
