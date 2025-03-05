
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { generateAudio } from "./audio-generator.ts"
import { saveAudioMetadata } from "./database-operations.ts"
import { uploadAudioFile } from "./storage-operations.ts"
import { fetchStoryContent } from "./story-operations.ts"

// Standard voice ID to use for all stories
const STANDARD_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to generate audio');
    const { storyId, voiceId } = await req.json()

    if (!storyId) {
      throw new Error('Story ID is required')
    }

    // Always use the standard voice ID to ensure consistency
    const finalVoiceId = STANDARD_VOICE_ID;
    console.log(`Generating audio for story: ${storyId} with voice: ${finalVoiceId}`)

    // Fetch story content from database
    const story = await fetchStoryContent(storyId)
    
    // Check for existing audio
    const existingAudioUrl = await checkExistingAudio(storyId)
    if (existingAudioUrl) {
      console.log(`Found existing audio: ${existingAudioUrl}`)
      return new Response(
        JSON.stringify({ audioUrl: existingAudioUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate audio using ElevenLabs API
    console.log(`Calling ElevenLabs API with standard voice ID...`)
    const audioBuffer = await generateAudio(story, finalVoiceId)
    
    // Upload to Supabase Storage
    const filename = `${storyId}-${Date.now()}.mp3`
    const publicUrl = await uploadAudioFile(filename, audioBuffer)
    
    // Save audio metadata
    await saveAudioMetadata(storyId, publicUrl, finalVoiceId)

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

// Helper function to check for existing audio
async function checkExistingAudio(storyId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Checking for existing audio...')
  const { data: existingAudio } = await supabase
    .from('story_audio')
    .select('audio_url')
    .eq('story_id', storyId)
    .maybeSingle()

  return existingAudio?.audio_url || null
}

// Need to add this import at the top since we're using it in the function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
