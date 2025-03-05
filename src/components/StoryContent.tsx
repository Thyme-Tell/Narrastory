
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { isLoading, audioUrl, error, generateAudio, updatePlaybackStats } = useStoryAudio(storyId);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const { toast } = useToast();

  const handleListen = async () => {
    console.log('Listen button clicked for story:', storyId);
    console.log('Content length:', content.length);
    console.log('Current audio URL:', audioUrl);
    
    if (!content || content.trim() === '') {
      toast({
        title: "Error",
        description: "Story content is empty. Cannot generate audio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!audioUrl) {
      console.log('No existing audio URL, generating new audio...');
      // Use a specific voice ID from ElevenLabs
      const voiceId = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice
      try {
        const generatedUrl = await generateAudio(voiceId);
        if (generatedUrl) {
          setShowPlayer(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to generate audio. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Error in handleListen:', err);
        toast({
          title: "Error",
          description: `Failed to generate audio: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } else {
      setShowPlayer(true);
    }
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
      
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md text-sm">
          Error: {error}
        </div>
      )}
      
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
