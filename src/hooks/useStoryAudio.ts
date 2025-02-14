
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
      const { data, error } = await supabase.functions.invoke('story-tts', {
        body: { storyId, voiceId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAudioUrl(data.audioUrl);
      
      toast({
        title: "Success",
        description: "Audio generated successfully",
      });
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to generate audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [storyId, toast]);

  useEffect(() => {
    const fetchExistingAudio = async () => {
      try {
        const { data, error } = await supabase
          .from('story_audio')
          .select('audio_url')
          .eq('story_id', storyId)
          .single();

        if (error) throw error;
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
      // Get current playback count
      const { data: currentStats } = await supabase
        .from('story_audio')
        .select('playback_count')
        .eq('story_id', storyId)
        .single();

      // Update with incremented count
      await supabase
        .from('story_audio')
        .update({
          playback_count: (currentStats?.playback_count || 0) + 1,
          last_played_at: new Date().toISOString(),
        })
        .eq('story_id', storyId);
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
