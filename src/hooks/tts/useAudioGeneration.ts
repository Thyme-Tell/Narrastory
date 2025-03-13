
import { useState, useCallback } from 'react';
import { TTSOptions, TTSResult } from '@/services/tts/TTSProvider';
import { TTSFactory, TTSProviderType } from '@/services/tts/TTSFactory';
import { useToast } from '@/hooks/use-toast';

interface UseAudioGenerationOptions {
  onError?: (error: Error) => void;
}

export const useAudioGeneration = (options: UseAudioGenerationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate audio from text
  const generateAudio = useCallback(async (
    text: string, 
    ttsOptions?: Partial<TTSOptions>,
    storyId?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentProvider = TTSFactory.getActiveProviderType();
      if (!currentProvider) {
        throw new Error('TTS service not initialized');
      }
      
      const provider = TTSFactory.getProvider(currentProvider);
      if (!provider) {
        throw new Error(`Provider ${currentProvider} not available`);
      }
      
      // If storyId provided, use existing endpoint, otherwise use direct generation
      let result: TTSResult;
      
      if (storyId) {
        // Use the existing story-tts function for backwards compatibility
        const { data, error: invokeError } = await fetch('/api/story-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId })
        }).then(res => res.json());
        
        if (invokeError) {
          throw new Error(`Function invocation error: ${invokeError}`);
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }
        
        if (!data?.audioUrl) {
          throw new Error('No audio URL returned');
        }
        
        result = { audioUrl: data.audioUrl, format: 'mp3' };
      } else {
        // Use the abstraction layer for direct text-to-speech
        result = await provider.generateAudio(text, {
          voiceId: ttsOptions?.voiceId,
          ...ttsOptions
        });
      }
      
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
        toast({
          title: "Success",
          description: "Audio ready for playback",
        });
        return result.audioUrl;
      }
      
      return null;
    } catch (err: any) {
      console.error('TTS generation error:', err);
      let errorMessage = err.message || 'An unknown error occurred';
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to get audio: ${errorMessage}`,
        variant: "destructive",
      });
      
      if (options.onError) {
        options.onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, options.onError]);

  return {
    isLoading,
    audioUrl,
    error,
    generateAudio,
    setAudioUrl,
    setError
  };
};
