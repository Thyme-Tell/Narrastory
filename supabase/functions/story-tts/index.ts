
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { generateAudio as generateAudioElevenLabs } from "./audio-generator.ts"
import { saveAudioMetadata } from "./database-operations.ts"
import { uploadAudioFile } from "./storage-operations.ts"
import { fetchStoryContent } from "./story-operations.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Standard voice IDs for providers
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to generate audio');
    const requestBody = await req.json();
    
    // Support both existing story-based requests and direct text-to-speech
    if (requestBody.directGeneration && requestBody.textContent) {
      // Direct text-to-speech generation mode
      console.log('Processing direct TTS request');
      const { textContent, voiceId, options } = requestBody;
      
      try {
        // Generate audio directly from text using ElevenLabs
        console.log('Using ElevenLabs for direct generation');
        const audioBuffer = await generateAudioElevenLabs(
          { content: textContent, title: null },
          voiceId || ELEVENLABS_VOICE_ID,
          options
        );
        
        // Upload to storage
        const filename = `direct-${Date.now()}.mp3`;
        const publicUrl = await uploadAudioFile(filename, audioBuffer);
        
        return new Response(
          JSON.stringify({ audioUrl: publicUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (directError) {
        console.error('Error in direct TTS generation:', directError.message);
        return new Response(
          JSON.stringify({ error: directError.message }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Original story-based flow
    const { storyId, voiceId } = requestBody;

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Story ID is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing audio request for story: ${storyId} using ElevenLabs`);

    // Check for existing audio first
    console.log('Checking for existing audio...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: existingAudio, error: audioCheckError } = await supabase
      .from('story_audio')
      .select('audio_url')
      .eq('story_id', storyId)
      .maybeSingle()
      
    if (audioCheckError) {
      console.error('Error checking for existing audio:', audioCheckError.message);
    }

    if (existingAudio?.audio_url) {
      console.log(`Found existing audio: ${existingAudio.audio_url}`)
      return new Response(
        JSON.stringify({ audioUrl: existingAudio.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // No existing audio found, generate new audio
    console.log(`Generating new audio with ElevenLabs - TOKENS WILL BE USED NOW`)
    
    try {
      // Fetch story content from database
      const story = await fetchStoryContent(storyId)
      
      // Generate audio using ElevenLabs
      const selectedVoiceId = voiceId || ELEVENLABS_VOICE_ID;
      console.log(`Calling ElevenLabs API with voice ID: ${selectedVoiceId}`)
      const audioBuffer = await generateAudioElevenLabs(story, selectedVoiceId)
      
      // Upload to Supabase Storage
      const filename = `${storyId}-${Date.now()}.mp3`
      const publicUrl = await uploadAudioFile(filename, audioBuffer)
      
      // Save audio metadata - may or may not include provider field depending on schema
      try {
        await saveAudioMetadata(storyId, publicUrl, selectedVoiceId, 'elevenlabs')
      } catch (metadataError) {
        console.error('Error saving metadata, trying without provider:', metadataError.message);
        // Try again without provider field
        await saveAudioMetadata(storyId, publicUrl, selectedVoiceId)
      }
  
      return new Response(
        JSON.stringify({ audioUrl: publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (funcError) {
      console.error('Error in audio generation process:', funcError.message)
      
      // Always return a 200 status with error in the body
      return new Response(
        JSON.stringify({ error: funcError.message }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error:', error.message, error.stack)
    
    // Always return a 200 status with error in the body
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
