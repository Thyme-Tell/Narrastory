
/**
 * Generates audio using ElevenLabs API
 */
export async function generateAudio(
  story: { content: string; title: string | null },
  voiceId: string,
  options?: {
    stability?: number;
    similarityBoost?: number;
    modelId?: string;
  }
): Promise<ArrayBuffer> {
  // Check if ELEVEN_LABS_API_KEY is set
  const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY environment variable is not set')
  }

  // Prepare text for TTS
  const text = `${story.title ? story.title + ". " : ""}${story.content}`
  console.log(`Text prepared for TTS, length: ${text.length} characters`)

  // Use options or defaults
  const stability = options?.stability ?? 0.5;
  const similarityBoost = options?.similarityBoost ?? 0.5;
  const modelId = options?.modelId ?? "eleven_monolingual_v1";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  )

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error('ElevenLabs API error:', response.status, JSON.stringify(errorData));
      
      // Check for quota exceeded error
      if (errorData.detail?.status === 'quota_exceeded') {
        throw new Error('ElevenLabs quota exceeded. Please try again later or upgrade your plan.');
      }
      
      throw new Error(errorData.detail?.message || 'Failed to generate audio');
    } catch (e) {
      if (e.message.includes('quota exceeded')) {
        throw e;
      }
      throw new Error(`Failed to generate audio: ${response.status} ${await response.text()}`);
    }
  }

  console.log('Audio generated successfully')

  // Get the audio data
  const audioBuffer = await response.arrayBuffer()
  console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`)
  
  return audioBuffer
}
