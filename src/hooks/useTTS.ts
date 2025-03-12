
import { useState, useEffect, useCallback } from 'react';
import { TTSOptions, TTSResult, TTSVoice, TTSError } from '@/services/tts/TTSProvider';
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
  const [voices, setVoices] = useState<TTSVoice[]>([]);
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
        }
        
        // Load available voices
        const availableVoices = await provider.getAvailableVoices();
        setVoices(availableVoices);
        
        // If no default voice set but voices available, use the first one
        if (!currentVoiceId && availableVoices.length > 0 && !options.defaultVoiceId) {
          setCurrentVoiceId(availableVoices[0].id);
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
    
    if (!text || text.trim() === '') {
      setError('Text is required');
      toast({
        title: "Cannot Generate Audio",
        description: "No text content provided. Please add some text before generating audio.",
        variant: "destructive",
      });
      return null;
    }
    
    if (!currentVoiceId) {
      setError('No voice selected');
      return null;
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

  // Change the TTS provider
  const changeProvider = useCallback(async (providerType: TTSProviderType) => {
    try {
      let provider = TTSFactory.getProvider(providerType);
      
      if (!provider) {
        provider = TTSFactory.createProvider(providerType);
      }
      
      TTSFactory.setActiveProvider(providerType);
      setCurrentProvider(providerType);
      
      // Load available voices for the new provider
      const availableVoices = await provider.getAvailableVoices();
      setVoices(availableVoices);
      
      // Reset voice selection
      if (availableVoices.length > 0) {
        setCurrentVoiceId(availableVoices[0].id);
      } else {
        setCurrentVoiceId(null);
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
    voices,
    currentProvider,
    currentVoiceId,
    generateAudio,
    changeProvider,
    setCurrentVoiceId,
  };
};
