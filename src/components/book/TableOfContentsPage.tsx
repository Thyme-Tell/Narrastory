
import React from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";

interface TableOfContentsPageProps {
  stories: Story[];
  storyPages: number[];
  jumpToPage?: (pageIndex: number) => void;
  bookTitle?: string;
  storyMediaMap?: Map<string, StoryMediaItem[]>;
  onSelectPage?: (pageIndex: number) => void;
}

const TableOfContentsPage: React.FC<TableOfContentsPageProps> = ({
  stories,
  storyPages,
  jumpToPage,
  onSelectPage,
  bookTitle = "My Book"
}) => {
  // Use either jumpToPage or onSelectPage (for backward compatibility)
  const handlePageSelect = (pageIndex: number) => {
    if (jumpToPage) {
      jumpToPage(pageIndex);
    } else if (onSelectPage) {
      onSelectPage(pageIndex);
    }
  };

  return (
    <div className="book-page w-full h-full overflow-y-auto">
      <div className="book-content p-6">
        <h1 className="text-center text-xl font-semibold mb-6">Your Story List</h1>
        
        {/* Stories entries - simplified to only show title and page number */}
        {stories.map((story, index) => {
          const startPage = storyPages[index];
          
          // Skip if startPage is undefined
          if (typeof startPage !== 'number') return null;
          
          return (
            <div key={story.id} className="mb-4">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => handlePageSelect(startPage)}
              >
                <span className="font-medium">{story.title || "Untitled Story"}</span>
                <span className="text-right">{startPage + 1}</span>
              </div>
            </div>
          );
        })}
        
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
          {bookTitle}
        </div>
      </div>
    </div>
  );
};

export default TableOfContentsPage;
