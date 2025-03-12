
import React from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { calculateStoryPages } from "@/utils/bookPagination";
import { Book, FileText, FileImage } from "lucide-react";

interface TableOfContentsPageProps {
  stories: Story[];
  bookTitle: string;
  storyPages: number[];
  storyMediaMap: Map<string, StoryMediaItem[]>;
  onSelectPage: (pageIndex: number) => void;
}

const TableOfContentsPage: React.FC<TableOfContentsPageProps> = ({
  stories,
  bookTitle,
  storyPages,
  storyMediaMap,
  onSelectPage
}) => {
  return (
    <div className="book-page w-full h-full overflow-y-auto">
      <div className="book-content p-6">
        <h1 className="text-center text-xl font-semibold mb-6">Table of Contents</h1>
        
        {/* Cover entry */}
        <div className="mb-4">
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => onSelectPage(0)}
          >
            <span className="font-medium">Cover</span>
            <span className="text-right">1</span>
          </div>
        </div>
        
        {/* Stories entries */}
        {stories.map((story, index) => {
          const startPage = storyPages[index];
          const storyTextPages = calculateStoryPages(story);
          const mediaItems = storyMediaMap.get(story.id) || [];
          
          return (
            <div key={story.id} className="mb-4">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => onSelectPage(startPage)}
              >
                <div className="flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  <span className="font-medium">{story.title || "Untitled Story"}</span>
                </div>
                <span className="text-right">{startPage + 1}</span>
              </div>
              
              {/* Text pages */}
              <div className="ml-6 mt-1">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-2" />
                    <span>Content</span>
                  </div>
                  <span>
                    {startPage + 1}{storyTextPages > 1 ? ` - ${startPage + storyTextPages}` : ""}
                  </span>
                </div>
                
                {/* Media pages if any */}
                {mediaItems.length > 0 && (
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <FileImage className="h-3 w-3 mr-2" />
                      <span>Images ({mediaItems.length})</span>
                    </div>
                    <span>
                      {startPage + storyTextPages + 1}
                      {mediaItems.length > 1 ? 
                        ` - ${startPage + storyTextPages + mediaItems.length}` : 
                        ""}
                    </span>
                  </div>
                )}
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
