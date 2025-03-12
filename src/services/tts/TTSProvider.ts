
/**
 * TextToSpeech Provider Interface
 * Base interface that all TTS providers must implement
 */
export interface TTSProvider {
  /**
   * Generate audio from text
   * @param text The text to convert to speech
   * @param options Provider-specific options
   * @returns Promise resolving to an audio buffer or URL
   */
  generateAudio(text: string, options?: TTSOptions): Promise<TTSResult>;
  
  /**
   * Get available voices for the provider
   * @returns Promise resolving to array of available voices
   */
  getAvailableVoices(): Promise<TTSVoice[]>;
  
  /**
   * Initialize the provider with necessary credentials/config
   * @param config Provider configuration
   */
  initialize(config: TTSProviderConfig): void;

  /**
   * Check if the provider is ready to use
   * @returns boolean indicating if the provider is ready
   */
  isReady(): boolean;
}

/**
 * Generic TTS options shared across providers
 */
export interface TTSOptions {
  voiceId: string;
  language?: string;
  speed?: number;
  pitch?: number;
  [key: string]: any; // For provider-specific options
}

/**
 * Standard voice metadata
 */
export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  provider: string;
  previewUrl?: string;
}

/**
 * Result from TTS generation
 */
export interface TTSResult {
  audioUrl?: string;
  audioBuffer?: ArrayBuffer;
  format: 'mp3' | 'wav' | 'ogg' | string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Provider configuration
 */
export interface TTSProviderConfig {
  apiKey?: string;
  region?: string;
  endpoint?: string;
  [key: string]: any; // For other provider-specific config
}

/**
 * Error thrown by TTS providers
 */
export class TTSError extends Error {
  constructor(
    message: string, 
    public readonly provider: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'TTSError';
  }
}
