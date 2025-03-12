
import { TTSProvider, TTSOptions, TTSResult, TTSVoice, TTSProviderConfig, TTSError } from '../TTSProvider';
import { supabase } from '@/integrations/supabase/client';

/**
 * Amazon Polly-specific options
 */
export interface AmazonPollyOptions extends TTSOptions {
  engine?: 'standard' | 'neural';
  sampleRate?: string;
  lexiconNames?: string[];
}

export interface AmazonPollyConfig extends TTSProviderConfig {
  region: string;
  accessKeyId?: string; 
  secretAccessKey?: string;
  // We'll use edge functions so these aren't needed client-side
}

/**
 * Amazon Polly Provider Implementation
 */
export class AmazonPollyProvider implements TTSProvider {
  private initialized = false;
  private region: string = 'us-east-1';
  
  constructor(config?: AmazonPollyConfig) {
    if (config) {
      this.initialize(config);
    }
  }

  initialize(config: AmazonPollyConfig): void {
    this.region = config.region || 'us-east-1';
    this.initialized = true; // For Polly we don't need client-side credentials
  }

  isReady(): boolean {
    return this.initialized;
  }

  async generateAudio(text: string, options: AmazonPollyOptions): Promise<TTSResult> {
    if (!this.isReady()) {
      throw new TTSError('Amazon Polly provider not initialized', 'amazon-polly');
    }

    if (!options.voiceId) {
      throw new TTSError('Voice ID is required', 'amazon-polly');
    }

    try {
      // Using an edge function to handle the AWS SDK interactions
      const { data, error } = await supabase.functions.invoke('polly-tts', {
        body: { 
          textContent: text,
          voiceId: options.voiceId,
          options: {
            engine: options.engine || 'neural',
            sampleRate: options.sampleRate || '22050',
            lexiconNames: options.lexiconNames || [],
            language: options.language || 'en-US'
          }
        }
      });

      if (error) {
        throw new TTSError(`Function invocation error: ${error.message}`, 'amazon-polly');
      }

      if (data.error) {
        throw new TTSError(data.error, 'amazon-polly');
      }

      if (!data.audioUrl) {
        throw new TTSError('No audio URL returned from function', 'amazon-polly');
      }

      return {
        audioUrl: data.audioUrl,
        format: 'mp3',
        metadata: {
          provider: 'amazon-polly',
          voiceId: options.voiceId,
          engine: options.engine || 'neural'
        }
      };
    } catch (err: any) {
      if (err instanceof TTSError) {
        throw err;
      }
      throw new TTSError(`Failed to generate audio: ${err.message}`, 'amazon-polly');
    }
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // Hardcoded list of Amazon Polly voices
    // In a real implementation, this would fetch from the AWS API
    return [
      {
        id: "Joanna",
        name: "Joanna",
        language: "en-US",
        gender: "female",
        provider: "amazon-polly",
      },
      {
        id: "Matthew",
        name: "Matthew",
        language: "en-US",
        gender: "male",
        provider: "amazon-polly",
      },
      {
        id: "Amy",
        name: "Amy",
        language: "en-GB",
        gender: "female",
        provider: "amazon-polly",
      },
      {
        id: "Brian",
        name: "Brian",
        language: "en-GB",
        gender: "male",
        provider: "amazon-polly",
      },
    ];
  }
}
