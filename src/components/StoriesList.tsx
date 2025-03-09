
import StoryCard from "./StoryCard";
import { Story } from "@/types/supabase";

interface StoriesListProps {
  stories: Story[];
  isLoading: boolean;
  onUpdate: () => void;
}

const StoriesList = ({ stories, isLoading, onUpdate }: StoriesListProps) => {
  if (isLoading) {
    return <p className="text-muted-foreground">Loading stories...</p>;
  }

  return (
    <div className="space-y-4">
      {stories?.map((story) => (
        <StoryCard 
          key={story.id} 
          story={story}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default StoriesList;
