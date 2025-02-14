
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSynthflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthesizeText = async (text: string, storyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling synthflow function with text:', text);
      const { data, error: functionError } = await supabase.functions.invoke('synthflow', {
        body: { text },
      });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!data || !data.audio_url) {
        throw new Error('No audio URL received from synthesis');
      }

      // Store the audio URL in the story_audio table
      const { error: insertError } = await supabase
        .from('story_audio')
        .insert({
          story_id: storyId,
          audio_url: data.audio_url,
        });

      if (insertError) {
        console.error('Error storing audio URL:', insertError);
        throw new Error('Failed to store audio URL');
      }

      console.log('Synthesis successful:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to synthesize text';
      console.error('Synthflow error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    synthesizeText,
    isLoading,
    error,
  };
};
