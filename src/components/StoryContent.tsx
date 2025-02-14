
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useSynthflow } from "@/hooks/useSynthflow";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { useToast } from "./ui/use-toast";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const { synthesizeText, isLoading } = useSynthflow();
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSynthesize = async () => {
    const textToSynthesize = `${title ? title + '. ' : ''}${content}`;
    const result = await synthesizeText(textToSynthesize, storyId);
    
    if (result?.audio_url) {
      setAudioUrl(result.audio_url);
    } else {
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
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
          onClick={handleSynthesize}
          disabled={isLoading}
          className="ml-auto"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          {isLoading ? "Generating..." : "Listen"}
        </Button>
      </div>
      
      {audioUrl && (
        <audio
          controls
          className="w-full mb-4"
          src={audioUrl}
        >
          Your browser does not support the audio element.
        </audio>
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
