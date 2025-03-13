
import { useState, useEffect, useCallback } from 'react';
import { TTSProviderType, TTSFactory } from '@/services/tts/TTSFactory';
import { TTSProviderConfig } from '@/services/tts/TTSProvider';

interface UseProviderManagementOptions {
  defaultProvider?: TTSProviderType;
  defaultVoiceId?: string;
  onError?: (error: Error) => void;
}

export const useProviderManagement = (options: UseProviderManagementOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<TTSProviderType | null>(null);
  const [currentVoiceId, setCurrentVoiceId] = useState<string | null>(null);

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
        if (options.onError) {
          options.onError(err);
        }
      }
    };
    
    initializeProvider();
  }, [options.defaultProvider, options.defaultVoiceId, options.onError]);

  // Change the TTS provider and set default voice for that provider
  const changeProvider = useCallback(async (providerType: TTSProviderType, config?: TTSProviderConfig) => {
    try {
      let provider = TTSFactory.getProvider(providerType);
      
      if (!provider) {
        provider = TTSFactory.createProvider(providerType, config);
      } else if (config) {
        // Reinitialize with new config if provided
        provider.initialize(config);
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
      if (options.onError) {
        options.onError(err);
      }
      return false;
    }
  }, [options.onError]);

  return {
    isInitialized,
    currentProvider,
    currentVoiceId,
    setCurrentVoiceId,
    changeProvider
  };
};
