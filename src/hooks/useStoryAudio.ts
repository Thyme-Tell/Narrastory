
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
      console.log('Generating audio for story:', storyId, 'with voice:', voiceId || 'default');
      
      // First, check if the story exists and get its content
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('content, title')
        .eq('id', storyId)
        .single();
        
      if (storyError) {
        console.error('Error fetching story data:', storyError);
        throw new Error(`Story not found or inaccessible: ${storyError.message}`);
      }
      
      if (!storyData) {
        throw new Error('Story data is empty');
      }
      
      console.log('Story found:', storyData.title || 'Untitled', 'Content length:', storyData.content.length);
      
      // Check if content is empty
      if (!storyData.content || storyData.content.trim() === '') {
        throw new Error('Story content is empty');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('story-tts', {
        body: { 
          storyId, 
          voiceId: voiceId || "21m00Tcm4TlvDq8ikWAM" // Default ElevenLabs voice ID
        },
      });

      if (invokeError) {
        console.error('Function invocation error:', invokeError);
        throw new Error(`Function invocation error: ${invokeError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('Audio generation response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        toast({
          title: "Success",
          description: "Audio generated successfully",
        });
        
        return data.audioUrl;
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err: any) {
      console.error('Error generating audio:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to generate audio: ${err.message}`,
        variant: "destructive",
      });
      return null;
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

        if (error) {
          console.error('Error fetching audio:', error);
          throw error;
        }
        
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
        console.error('Error fetching playback stats:', statsError);
        throw statsError;
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
