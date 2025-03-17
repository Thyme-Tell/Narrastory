
import React, { useState } from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";

interface MediaPageViewProps {
  story: Story;
  mediaItem: StoryMediaItem;
  globalPageNumber: number;
  bookTitle: string;
}

const MediaPageView = ({ 
  story, 
  mediaItem, 
  globalPageNumber, 
  bookTitle 
}: MediaPageViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("story-media")
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  // Calculate progress based on global page number
  const progress = Math.round((globalPageNumber / 100) * 100);

  return (
    <div 
      className="w-full h-full overflow-auto book-page flex flex-col items-center justify-between"
      style={{
        backgroundImage: "url('https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//background-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full">
        <div className="flex justify-between items-center px-4 pt-4 pb-1 w-full">
          <div className="text-[#383838] text-[11pt] font-serif">
            {bookTitle}
          </div>
          <div className="text-[#383838] text-[11pt] font-serif">
            {globalPageNumber}/100
          </div>
        </div>
        
        <div className="px-4 pb-2 relative w-full">
          <Progress 
            value={progress} 
            className="h-[2px] w-full bg-[#242627]/[0.19] rounded-full" 
          />
        </div>
      </div>
      
      <div className="max-w-full max-h-[75%] flex justify-center items-center flex-1 relative px-[15px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-70 rounded-lg">
            <LoadingSpinner className="h-8 w-8 text-green-800" />
          </div>
        )}
        
        {mediaItem.content_type.startsWith("image/") ? (
          <div className="max-h-full flex flex-col items-center">
            <div className="media-display">
              <img 
                src={getPublicUrl(mediaItem.file_path)} 
                alt={mediaItem.caption || "Image"} 
                className={`max-h-[60vh] max-w-full object-contain rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                loading="lazy"
                onLoad={handleMediaLoad}
                onError={(e) => {
                  console.error("Error loading image:", e);
                  handleMediaError();
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
              className={`max-h-[60vh] max-w-full rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              onLoadedData={handleMediaLoad}
              onError={(e) => {
                console.error("Error loading video:", e);
                handleMediaError();
                const target = e.target as HTMLVideoElement;
                target.onerror = null;
              }}
              preload="metadata"
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
        
        {hasError && (
          <div className="text-center p-4 bg-red-50 text-red-600 rounded absolute inset-0 flex items-center justify-center">
            Failed to load media
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPageView;
