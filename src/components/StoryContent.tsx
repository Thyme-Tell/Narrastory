
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones, Settings } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import TTSProviderSelector from "./TTSProviderSelector";
import { TTSFactory } from "@/services/tts/TTSFactory";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const { 
    isLoading, 
    audioUrl, 
    error, 
    generateAudio, 
    updatePlaybackStats,
    changeProvider,
    currentProvider,
    voices,
    currentVoiceId,
    setCurrentVoiceId
  } = useStoryAudio(storyId);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Calculate estimated audio duration based on word count
  // Average reading speed is about 150 words per minute
  const wordCount = content.trim().split(/\s+/).length;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 150));

  const handleListen = async () => {
    console.log('Listen button clicked for story:', storyId);
    
    if (!content || content.trim() === '') {
      toast({
        title: "Cannot Generate Audio",
        description: "This story has no content. Please add some text before generating audio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!audioUrl) {
      console.log('No existing audio URL, requesting audio...');
      try {
        const generatedUrl = await generateAudio();
        if (generatedUrl) {
          setShowPlayer(true);
        }
      } catch (err) {
        console.error('Error in handleListen:', err);
        // Error already handled in useStoryAudio hook
      }
    } else {
      setShowPlayer(true);
    }
  };

  const handleProviderChange = async (provider: string) => {
    try {
      await changeProvider(provider as any);
      toast({
        title: "Provider Changed",
        description: `Switched to ${provider} voice service`,
      });
    } catch (err) {
      console.error('Error changing provider:', err);
      toast({
        title: "Error",
        description: "Failed to change provider",
        variant: "destructive",
      });
    }
  };

  // Get available providers from factory
  const availableProviders = TTSFactory.getRegisteredProviderTypes();

  return (
    <>
      {/* Responsive title and listen button layout */}
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'} mb-4`}>
        {title && (
          <h3 className="font-semibold text-lg text-left">{title}</h3>
        )}
        
        <div className={`${isMobile ? 'self-start' : 'ml-auto'} flex space-x-2`}>
          <Popover open={showTTSSettings} onOpenChange={setShowTTSSettings}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                title="TTS Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Text-to-Speech Settings</h4>
                <TTSProviderSelector
                  currentProvider={currentProvider}
                  providers={availableProviders}
                  voices={voices}
                  currentVoiceId={currentVoiceId}
                  isLoading={isLoading}
                  onProviderChange={handleProviderChange}
                  onVoiceChange={setCurrentVoiceId}
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleListen}
            disabled={isLoading || !content || content.trim() === ''}
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Headphones className="mr-2 h-4 w-4" />
            )}
            Listen ({estimatedMinutes} min)
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md text-sm">
          Error: {error}
        </div>
      )}
      
      {content && content.trim() === '' && (
        <div className="text-amber-700 mb-4 p-2 bg-amber-50 rounded-md text-sm">
          This story has no content. Add some text to generate audio.
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
