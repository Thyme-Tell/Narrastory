
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { isLoading, audioUrl, generateAudio, updatePlaybackStats } = useStoryAudio(storyId);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  const handleListen = async () => {
    if (!audioUrl) {
      await generateAudio();
    }
    setShowPlayer(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {title && (
          <h3 className="font-semibold text-lg text-left">{title}</h3>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleListen}
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <LoadingSpinner className="mr-2 h-4 w-4" />
          ) : (
            <Headphones className="mr-2 h-4 w-4" />
          )}
          Listen
        </Button>
      </div>
      
      {showPlayer && audioUrl && (
        <div className="mb-4">
          <AudioPlayer audioUrl={audioUrl} onPlay={updatePlaybackStats} />
        </div>
      )}
      
      <div className="text-atlantic text-left">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap mb-[10px]">
            {paragraph}
          </p>
        ))}
      </div>
      
      <div className="mt-[30px] mb-[20px]">
        <StoryMediaUpload storyId={storyId} onUploadComplete={onUpdate} />
      </div>
      <StoryMedia storyId={storyId} />
    </>
  );
};

export default StoryContent;
