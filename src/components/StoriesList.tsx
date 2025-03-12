
import { useState } from "react";
import StoryCard from "./StoryCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Book, Clock, List } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  share_token: string | null;
}

interface StoriesListProps {
  stories: Story[];
  isLoading: boolean;
  onUpdate: () => void;
}

const StoriesList = ({ stories, isLoading, onUpdate }: StoriesListProps) => {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  // Helper function to calculate word count
  const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).length;
  };

  // Helper function to format the date
  const formatDate = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Sort stories in reverse chronological order (newest first)
  const sortedStories = [...stories].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (isLoading) {
    return <p className="text-muted-foreground">Loading stories...</p>;
  }

  if (sortedStories.length === 0) {
    return <p className="text-muted-foreground">No stories yet. Create your first story!</p>;
  }

  return (
    <div className="space-y-4">
      {/* Table of Contents */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden" data-toc-container>
        <Button 
          variant="ghost" 
          className="w-full flex justify-between items-center p-4 h-auto"
          onClick={() => setIsTocOpen(!isTocOpen)}
        >
          <div className="flex items-center space-x-2">
            <List className="h-5 w-5 text-[#A33D29]" />
            <span className="font-medium">Table of Contents</span>
          </div>
          {isTocOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
        
        {isTocOpen && (
          <div className="px-4 pb-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {sortedStories.map((story) => (
                <div 
                  key={story.id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                    selectedStoryId === story.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    const storyElement = document.getElementById(`story-${story.id}`);
                    storyElement?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium line-clamp-1">
                      {story.title || "Untitled Story"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(story.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Book className="h-3.5 w-3.5" />
                      <span>{calculateWordCount(story.content)} words</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story List */}
      <div className="space-y-4">
        {sortedStories.map((story) => (
          <div id={`story-${story.id}`} key={story.id}>
            <StoryCard 
              story={story}
              onUpdate={onUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesList;
