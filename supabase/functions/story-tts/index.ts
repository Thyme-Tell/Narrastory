
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
    console.log('Received request to generate audio');
    const { storyId, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json()

    if (!storyId) {
      throw new Error('Story ID is required')
    }

    console.log(`Generating audio for story: ${storyId} with voice: ${voiceId}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get story content
    console.log('Fetching story content...');
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, title')
      .eq('id', storyId)
      .single()

    if (storyError) {
      console.error('Story fetch error:', storyError)
      throw new Error(storyError?.message || 'Story not found')
    }

    if (!story) {
      throw new Error('Story not found')
    }

    if (!story.content || story.content.trim() === '') {
      throw new Error('Story content is empty')
    }

    console.log(`Story found: ${story.title || 'Untitled'}, Content length: ${story.content.length}`)

    // Prepare text for TTS
    const text = `${story.title ? story.title + ". " : ""}${story.content}`
    console.log(`Text prepared for TTS, length: ${text.length} characters`)

    // Check for existing audio
    console.log('Checking for existing audio...')
    const { data: existingAudio } = await supabase
      .from('story_audio')
      .select('audio_url')
      .eq('story_id', storyId)
      .maybeSingle()

    if (existingAudio?.audio_url) {
      console.log(`Found existing audio: ${existingAudio.audio_url}`)
      return new Response(
        JSON.stringify({ audioUrl: existingAudio.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('No existing audio found, generating new audio...')

    // Check if ELEVEN_LABS_API_KEY is set
    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ELEVEN_LABS_API_KEY environment variable is not set')
    }

    // Generate audio using ElevenLabs API
    console.log(`Calling ElevenLabs API with voice ID: ${voiceId}...`)
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
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    )

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Failed to read error response';
      }
      console.error('ElevenLabs API error:', response.status, errorText)
      throw new Error(`Failed to generate audio: ${response.status} ${errorText}`)
    }

    console.log('Audio generated successfully')

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`)

    // Check if bucket exists
    console.log('Checking if story-audio bucket exists...')
    const { data: buckets } = await supabase
      .storage
      .listBuckets()
      
    const bucketExists = buckets?.some(bucket => bucket.name === 'story-audio')
    
    if (!bucketExists) {
      console.log('Creating story-audio bucket')
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('story-audio', {
          public: true,
        })
        
      if (createBucketError) {
        console.error('Failed to create storage bucket:', createBucketError)
        throw new Error(`Failed to create storage bucket: ${createBucketError.message}`)
      }
    }

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
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
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
      throw new Error(`Failed to save audio metadata: ${metadataError.message}`)
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
