
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { storyId, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json()

    if (!storyId) {
      throw new Error('Story ID is required')
    }

    console.log(`Generating audio for story: ${storyId} with voice: ${voiceId}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get story content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      console.error('Story fetch error:', storyError)
      throw new Error('Story not found')
    }

    // Prepare text for TTS
    const text = `${story.title ? story.title + ". " : ""}${story.content}`
    console.log(`Text prepared for TTS, length: ${text.length} characters`)

    // Check for existing audio
    console.log('Checking for existing audio...')
    const { data: existingAudio } = await supabase
      .from('story_audio')
      .select('*')
      .eq('story_id', storyId)
      .maybeSingle()

    if (existingAudio) {
      console.log(`Found existing audio: ${existingAudio.audio_url}`)
      return new Response(
        JSON.stringify({ audioUrl: existingAudio.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('No existing audio found, generating new audio...')

    // Generate audio using ElevenLabs API
    console.log('Calling ElevenLabs API...')
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY')!,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', errorData)
      throw new Error('Failed to generate audio: ' + errorData)
    }

    console.log('Audio generated successfully')

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`)

    // Upload to Supabase Storage
    const filename = `${storyId}-${Date.now()}.mp3`
    console.log(`Uploading audio to storage with filename: ${filename}`)

    const { error: uploadError } = await supabase
      .storage
      .from('story-audio')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error('Failed to upload audio: ' + uploadError.message)
    }

    console.log('Audio uploaded successfully')

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('story-audio')
      .getPublicUrl(filename)

    console.log(`Public URL generated: ${publicUrl}`)

    // Save audio metadata
    console.log('Saving audio metadata to database...')
    const { error: metadataError } = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: publicUrl,
        voice_id: voiceId,
        playback_count: 0,
        audio_type: 'standard'
      })

    if (metadataError) {
      console.error('Metadata save error:', metadataError)
      throw new Error('Failed to save audio metadata: ' + metadataError.message)
    }

    console.log('Audio metadata saved successfully')

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message, error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
