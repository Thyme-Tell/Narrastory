
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
  
  // Define constants for content pagination
  const CHARS_PER_PAGE = 1800; // Slightly conservative estimate
  const TITLE_SPACE = 150; // Approximate character equivalent of space taken by title and date
  
  // Calculate content for this specific page
  let pageContent: string[] = [];
  
  if (pageNumber === 1) {
    // First page - account for title and date
    let charCount = 0;
    let paraIndex = 0;
    
    while (paraIndex < paragraphs.length && charCount + paragraphs[paraIndex].length <= CHARS_PER_PAGE - TITLE_SPACE) {
      pageContent.push(paragraphs[paraIndex]);
      charCount += paragraphs[paraIndex].length;
      paraIndex++;
    }
  } else {
    // Subsequent pages - calculate how much content should be skipped
    let totalCharsToSkip = CHARS_PER_PAGE - TITLE_SPACE; // First page capacity
    totalCharsToSkip += (pageNumber - 2) * CHARS_PER_PAGE; // Plus full pages in between
    
    // Skip content until we reach what should be shown on this page
    let charCount = 0;
    let paraIndex = 0;
    
    // Skip content that would be on previous pages
    while (paraIndex < paragraphs.length && charCount < totalCharsToSkip) {
      if (charCount + paragraphs[paraIndex].length <= totalCharsToSkip) {
        // This paragraph fits entirely on previous pages
        charCount += paragraphs[paraIndex].length;
        paraIndex++;
      } else {
        // This paragraph spans across pages, take the remainder
        const charsToSkipInPara = totalCharsToSkip - charCount;
        // Save the remaining part of this paragraph for this page
        const remainingPart = paragraphs[paraIndex].substring(charsToSkipInPara);
        
        if (remainingPart.length > 0) {
          pageContent.push(remainingPart);
        }
        
        // Move to next paragraph
        charCount = totalCharsToSkip;
        paraIndex++;
        break;
      }
    }
    
    // Now add paragraphs that fit on this page
    let pageCharCount = pageContent.length > 0 ? pageContent[0].length : 0;
    
    // Add more paragraphs until we fill this page
    while (paraIndex < paragraphs.length && pageCharCount + paragraphs[paraIndex].length <= CHARS_PER_PAGE) {
      pageContent.push(paragraphs[paraIndex]);
      pageCharCount += paragraphs[paraIndex].length;
      paraIndex++;
    }
    
    // Check if we need to include a partial paragraph
    if (paraIndex < paragraphs.length && pageCharCount < CHARS_PER_PAGE) {
      const remainingSpace = CHARS_PER_PAGE - pageCharCount;
      const partialPara = paragraphs[paraIndex].substring(0, remainingSpace);
      pageContent.push(partialPara + "...");
    }
  }

  // Show media only on first page
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
  }, [pageContent, mediaItems, pageNumber]);

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
          {pageContent.map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
          
          {/* If content overflows to next page, show indicator */}
          {contentOverflows && !isLastPage && pageNumber * CHARS_PER_PAGE < story.content.length && (
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
