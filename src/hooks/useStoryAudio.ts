
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStoryAudio = (storyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateAudio = useCallback(async (voiceId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating audio for story:', storyId, 'with voice:', voiceId);
      
      const { data, error: invokeError } = await supabase.functions.invoke('story-tts', {
        body: { storyId, voiceId },
      });

      if (invokeError) {
        throw new Error(`Function invocation error: ${invokeError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from edge function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Audio generation response:', data);

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        toast({
          title: "Success",
          description: "Audio generated successfully",
        });
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to generate audio: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [storyId, toast]);

  useEffect(() => {
    const fetchExistingAudio = async () => {
      try {
        console.log('Fetching existing audio for story:', storyId);
        
        const { data, error } = await supabase
          .from('story_audio')
          .select('audio_url')
          .eq('story_id', storyId)
          .maybeSingle();

        if (error) throw error;
        
        console.log('Existing audio data:', data);
        
        if (data?.audio_url) {
          setAudioUrl(data.audio_url);
        }
      } catch (err) {
        console.error('Error fetching audio:', err);
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
        throw statsError;
      }

      // Only update if the record exists
      if (currentStats) {
        const newCount = (currentStats.playback_count || 0) + 1;
        console.log('Incrementing playback count to:', newCount);
        
        await supabase
          .from('story_audio')
          .update({
            playback_count: newCount,
            last_played_at: new Date().toISOString(),
          })
          .eq('story_id', storyId);
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
