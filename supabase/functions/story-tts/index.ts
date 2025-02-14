
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { storyId, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get story content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    // Check if audio already exists
    const { data: existingAudio } = await supabase
      .from('story_audio')
      .select('*')
      .eq('story_id', storyId)
      .maybeSingle()

    if (existingAudio?.audio_url) {
      return new Response(
        JSON.stringify({ audioUrl: existingAudio.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare text for TTS
    const text = `${story.title ? story.title + ". " : ""}${story.content}`

    // Generate audio using ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY!,
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
      throw new Error('Failed to generate audio')
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()

    // Upload to Supabase Storage
    const fileName = `${storyId}-${Date.now()}.mp3`
    const { error: uploadError, data: uploadData } = await supabase
      .storage
      .from('story-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error('Failed to upload audio')
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('story-audio')
      .getPublicUrl(fileName)

    // Save audio metadata
    const { error: metadataError } = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: publicUrl,
        voice_id: voiceId,
        playback_count: 0,
      })

    if (metadataError) {
      throw new Error('Failed to save audio metadata')
    }

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
