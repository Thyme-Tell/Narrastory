import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones, Settings } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TTSVoiceSelector from "./TTSVoiceSelector";
import { useTTS } from "@/hooks/useTTS";
import { TTSFactory } from "@/services/tts/TTSFactory";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const { 
    isLoading, 
    audioUrl, 
    error, 
    generateAudio, 
    updatePlaybackStats,
  } = useStoryAudio(storyId);
  
  const tts = useTTS({
    defaultProvider: 'elevenlabs',
    defaultVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  });
  
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    
    if (audioUrl) {
      console.log('Using existing audio URL:', audioUrl);
      setShowPlayer(true);
    } else {
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
    }
  };

  const handlePreviewVoice = async (text: string, voiceId: string) => {
    await tts.generateAudio(text, { voiceId });
  };
  
  const handleSaveVoicePreference = async (): Promise<void> => {
    if (tts.currentVoiceId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { error } = await supabase
            .from('profiles')
            .update({
              elevenlabs_voice_id: tts.currentVoiceId,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (error) throw error;
          
          TTSFactory.setActiveProvider('elevenlabs');
          
          toast({
            title: "Voice Preference Saved",
            description: "Your voice preference has been saved successfully.",
          });
        }
      } catch (err) {
        console.error('Error saving voice preference:', err);
        toast({
          title: "Error",
          description: "Failed to save voice preference.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'} mb-4`}>
        {title && (
          <h3 className="font-semibold text-lg text-left">{title}</h3>
        )}
        
        <div className={`${isMobile ? 'self-start' : 'ml-auto'} flex space-x-2`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVoiceSettings(true)}
            disabled={isLoading}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Voice Settings</span>
          </Button>
          
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
      
      <Dialog open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
          </DialogHeader>
          <div>
            <TTSVoiceSelector
              currentProvider="elevenlabs"
              currentVoiceId={tts.currentVoiceId}
              providers={['elevenlabs']}
              isLoading={tts.isLoading}
              onProviderChange={() => {}} // No-op since we only support ElevenLabs
              onVoiceChange={(voiceId) => tts.setCurrentVoiceId(voiceId)}
              onPreviewVoice={handlePreviewVoice}
              onSavePreference={handleSaveVoicePreference}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryContent;
