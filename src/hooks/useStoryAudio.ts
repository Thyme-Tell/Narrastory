
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTTS } from '@/hooks/useTTS';
import { TTSFactory } from '@/services/tts/TTSFactory';

// Initialize the TTS Factory with ElevenLabs as the default provider
const defaultVoiceId = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice

// Ensure ElevenLabs provider is registered
if (!TTSFactory.getProvider('elevenlabs')) {
  TTSFactory.createProvider('elevenlabs');
  TTSFactory.setActiveProvider('elevenlabs');
}

export const useStoryAudio = (storyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use our TTS hook with fixed voice selection
  const tts = useTTS({
    defaultProvider: 'elevenlabs',
    defaultVoiceId,
    onError: (err) => console.error('TTS error:', err)
  });

  const generateAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting audio for story:', storyId);
      
      // Use the TTS abstraction layer to generate audio
      const generatedUrl = await tts.generateAudio('', {}, storyId);
      
      if (generatedUrl) {
        setAudioUrl(generatedUrl);
        return generatedUrl;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error with audio:', err);
      const errorMessage = err.message || 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to get audio: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storyId, toast, tts]);

  useEffect(() => {
    const fetchExistingAudio = async () => {
      try {
        // Simply call the same function that handles both generating and checking
        // But don't display toast messages for initial loading
        setIsLoading(true);
        const response = await supabase.functions.invoke('story-tts', {
          body: { storyId }
        });
        
        const { data, error } = response;
        
        if (error) {
          console.error('Error checking for existing audio:', error);
          return;
        }

        if (data?.error) {
          console.error('Function returned error:', data.error);
          return;
        }
        
        if (data?.audioUrl) {
          setAudioUrl(data.audioUrl);
        }
      } catch (err) {
        console.error('Error checking for existing audio:', err);
        // Don't display errors during initial check
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAudio();
  }, [storyId]);

  const updatePlaybackStats = useCallback(async () => {
    try {
      console.log('Updating playback stats for story:', storyId);
      
      // Get current playback count
      const { data: currentStats, error: statsError } = await supabase
        .from('story_audio')
        .select('playback_count')
        .eq('story_id', storyId)
        .maybeSingle();

      if (statsError) {
        console.error('Error fetching playback stats:', statsError);
        return; // Don't throw, just log and continue
      }

      // Only update if the record exists
      if (currentStats) {
        const newCount = (currentStats.playback_count || 0) + 1;
        console.log('Incrementing playback count to:', newCount);
        
        const { error: updateError } = await supabase
          .from('story_audio')
          .update({
            playback_count: newCount,
            last_played_at: new Date().toISOString(),
          })
          .eq('story_id', storyId);
          
        if (updateError) {
          console.error('Error updating playback stats:', updateError);
        }
      }
    } catch (err) {
      console.error('Error updating playback stats:', err);
    }
  }, [storyId]);

  return {
    isLoading,
    audioUrl,
    error,
    generateAudio,
    updatePlaybackStats,
  };
};
