
import { useCallback } from 'react';
import { TTSOptions } from '@/services/tts/TTSProvider';
import { TTSProviderType } from '@/services/tts/TTSFactory';
import { useProviderManagement } from './tts/useProviderManagement';
import { useAudioGeneration } from './tts/useAudioGeneration';

interface UseTTSOptions {
  defaultProvider?: TTSProviderType;
  defaultVoiceId?: string;
  onError?: (error: Error) => void;
}

export const useTTS = (options: UseTTSOptions = {}) => {
  // Use smaller, more focused hooks
  const {
    isInitialized,
    currentProvider,
    currentVoiceId,
    setCurrentVoiceId,
    changeProvider
  } = useProviderManagement(options);

  const {
    isLoading,
    audioUrl,
    error,
    generateAudio: generateAudioBase,
    setError
  } = useAudioGeneration({
    onError: options.onError
  });

  // Wrap the generate function to handle voice ID
  const generateAudio = useCallback(async (
    text: string, 
    ttsOptions?: Partial<TTSOptions>,
    storyId?: string
  ): Promise<string | null> => {
    if (!isInitialized || !currentProvider) {
      setError('TTS service not initialized');
      return null;
    }
    
    // Merge the current voice ID with provided options
    const mergedOptions: Partial<TTSOptions> = {
      voiceId: currentVoiceId || undefined,
      ...ttsOptions
    };
    
    return generateAudioBase(text, mergedOptions, storyId);
  }, [isInitialized, currentProvider, currentVoiceId, generateAudioBase, setError]);

  return {
    isLoading,
    isInitialized,
    audioUrl,
    error,
    currentProvider,
    currentVoiceId,
    generateAudio,
    changeProvider,
    setCurrentVoiceId
  };
};
