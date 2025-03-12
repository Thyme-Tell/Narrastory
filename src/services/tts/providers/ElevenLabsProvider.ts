
import { TTSProvider, TTSOptions, TTSResult, TTSVoice, TTSProviderConfig, TTSError } from '../TTSProvider';
import { supabase } from '@/integrations/supabase/client';

/**
 * ElevenLabs-specific options
 */
export interface ElevenLabsOptions extends TTSOptions {
  stability?: number;
  similarityBoost?: number;
  modelId?: string;
}

export interface ElevenLabsConfig extends TTSProviderConfig {
  apiKey: string;
}

/**
 * ElevenLabs Provider Implementation
 */
export class ElevenLabsProvider implements TTSProvider {
  private apiKey: string | null = null;
  private initialized = false;
  private readonly API_BASE_URL = 'https://api.elevenlabs.io/v1';
  private defaultModelId = 'eleven_monolingual_v1';
  
  constructor(config?: ElevenLabsConfig) {
    if (config) {
      this.initialize(config);
    }
  }

  initialize(config: ElevenLabsConfig): void {
    this.apiKey = config.apiKey;
    this.initialized = !!this.apiKey;
  }

  isReady(): boolean {
    return this.initialized;
  }

  async generateAudio(text: string, options: ElevenLabsOptions): Promise<TTSResult> {
    if (!this.isReady()) {
      throw new TTSError('ElevenLabs provider not initialized', 'elevenlabs');
    }

    if (!options.voiceId) {
      throw new TTSError('Voice ID is required', 'elevenlabs');
    }

    try {
      // For client-side, we'll use the edge function to avoid exposing API keys
      const { data, error } = await supabase.functions.invoke('story-tts', {
        body: { 
          textContent: text,
          voiceId: options.voiceId,
          directGeneration: true,
          options: {
            stability: options.stability || 0.5,
            similarityBoost: options.similarityBoost || 0.5,
            modelId: options.modelId || this.defaultModelId
          }
        }
      });

      if (error) {
        throw new TTSError(`Function invocation error: ${error.message}`, 'elevenlabs');
      }

      if (data.error) {
        // Special handling for quota exceeded error
        if (data.error.includes('quota exceeded')) {
          throw new TTSError('The text-to-speech service is currently unavailable due to quota limits. Please try again later or upgrade your plan.', 'elevenlabs', 'quota_exceeded');
        }
        throw new TTSError(data.error, 'elevenlabs');
      }

      if (!data.audioUrl) {
        throw new TTSError('No audio URL returned from function', 'elevenlabs');
      }

      return {
        audioUrl: data.audioUrl,
        format: 'mp3',
        metadata: {
          provider: 'elevenlabs',
          voiceId: options.voiceId
        }
      };
    } catch (err: any) {
      if (err instanceof TTSError) {
        throw err;
      }
      throw new TTSError(`Failed to generate audio: ${err.message}`, 'elevenlabs');
    }
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // For demo purposes, we'll return hardcoded voices
    // In a real implementation, this would call the ElevenLabs API
    return [
      {
        id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        language: "en-US",
        gender: "female",
        provider: "elevenlabs",
      },
      {
        id: "AZnzlk1XvdvUeBnXmlld",
        name: "Domi",
        language: "en-US",
        gender: "female",
        provider: "elevenlabs",
      },
      {
        id: "EXAVITQu4vr4xnSDxMaL",
        name: "Bella",
        language: "en-US",
        gender: "female",
        provider: "elevenlabs",
      },
      {
        id: "ErXwobaYiN019PkySvjV",
        name: "Antoni",
        language: "en-US",
        gender: "male",
        provider: "elevenlabs",
      },
    ];
  }
}
