
import { useState, useEffect, useCallback } from 'react';
import { TTSOptions, TTSResult } from '@/services/tts/TTSProvider';
import { TTSFactory, TTSProviderType } from '@/services/tts/TTSFactory';
import { useToast } from '@/hooks/use-toast';

interface UseTTSOptions {
  defaultProvider?: TTSProviderType;
  defaultVoiceId?: string;
  onError?: (error: Error) => void;
}

export const useTTS = (options: UseTTSOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<TTSProviderType | null>(null);
  const [currentVoiceId, setCurrentVoiceId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize TTS provider
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        // Default to ElevenLabs if no provider specified
        const providerType = options.defaultProvider || 'elevenlabs';
        
        // Check if provider already registered
        let provider = TTSFactory.getProvider(providerType);
        
        if (!provider) {
          // Create and initialize provider
          provider = TTSFactory.createProvider(providerType);
          
          // For ElevenLabs, we need to fetch the API key from environment
          // In a real app, you would get this from user input or environment
          if (providerType === 'elevenlabs') {
            provider.initialize({ apiKey: 'configured-at-runtime' });
          }
        }
        
        TTSFactory.setActiveProvider(providerType);
        setCurrentProvider(providerType);
        
        // Set default voice if provided
        if (options.defaultVoiceId) {
          setCurrentVoiceId(options.defaultVoiceId);
        } else {
          // Set default voices based on provider
          if (providerType === 'elevenlabs') {
            setCurrentVoiceId("21m00Tcm4TlvDq8ikWAM"); // Default ElevenLabs voice
          } else if (providerType === 'amazon-polly') {
            setCurrentVoiceId("Joanna"); // Default Amazon Polly voice
          }
        }
        
        setIsInitialized(true);
      } catch (err: any) {
        console.error('TTS initialization error:', err);
        setError(err.message);
        if (options.onError) {
          options.onError(err);
        }
      }
    };
    
    initializeProvider();
  }, [options.defaultProvider, options.defaultVoiceId]);

  // Generate audio from text
  const generateAudio = useCallback(async (
    text: string, 
    ttsOptions?: Partial<TTSOptions>,
    storyId?: string
  ): Promise<string | null> => {
    if (!isInitialized || !currentProvider) {
      setError('TTS service not initialized');
      return null;
    }
    
    if (!currentVoiceId) {
      // Set default voice if none is selected
      if (currentProvider === 'elevenlabs') {
        setCurrentVoiceId("21m00Tcm4TlvDq8ikWAM");
      } else if (currentProvider === 'amazon-polly') {
        setCurrentVoiceId("Joanna");
      } else {
        setError('No voice selected');
        return null;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
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
          voiceId: currentVoiceId,
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
  }, [isInitialized, currentProvider, currentVoiceId, toast, options.onError]);

  // Change the TTS provider and set default voice for that provider
  const changeProvider = useCallback(async (providerType: TTSProviderType) => {
    try {
      let provider = TTSFactory.getProvider(providerType);
      
      if (!provider) {
        provider = TTSFactory.createProvider(providerType);
      }
      
      TTSFactory.setActiveProvider(providerType);
      setCurrentProvider(providerType);
      
      // Set default voice based on provider
      if (providerType === 'elevenlabs') {
        setCurrentVoiceId("21m00Tcm4TlvDq8ikWAM");
      } else if (providerType === 'amazon-polly') {
        setCurrentVoiceId("Joanna");
      }
      
      return true;
    } catch (err: any) {
      console.error('Error changing TTS provider:', err);
      setError(err.message);
      return false;
    }
  }, []);

  return {
    isLoading,
    isInitialized,
    audioUrl,
    error,
    currentProvider,
    currentVoiceId,
    generateAudio,
    changeProvider,
    setCurrentVoiceId, // Keep this function for internal use
  };
};
