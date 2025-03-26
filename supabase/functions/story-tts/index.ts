
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { generateAudio as generateAudioElevenLabs } from "./audio-generator.ts"
import { generateAudioPolly } from "./audio-generator-polly.ts"
import { saveAudioMetadata } from "./database-operations.ts"
import { uploadAudioFile } from "./storage-operations.ts"
import { fetchStoryContent } from "./story-operations.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Standard voice IDs for providers
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice
const POLLY_VOICE_ID = "Joanna"; // Amazon Polly standard voice

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
      const { textContent, voiceId, providerType, options } = requestBody;
      
      try {
        // Generate audio directly from text based on provider
        let audioBuffer;
        
        if (providerType === 'amazon-polly') {
          console.log('Using Amazon Polly for direct generation');
          audioBuffer = await generateAudioPolly(
            { content: textContent, title: null },
            voiceId || POLLY_VOICE_ID,
            options
          );
        } else {
          // Default to ElevenLabs
          console.log('Using ElevenLabs for direct generation');
          audioBuffer = await generateAudioElevenLabs(
            { content: textContent, title: null },
            voiceId || ELEVENLABS_VOICE_ID,
            options
          );
        }
        
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
    const { storyId, providerType = 'amazon-polly', voiceId } = requestBody;

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Story ID is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing audio request for story: ${storyId} using provider: ${providerType}`);

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
    
    const { data: existingAudio } = await supabase
      .from('story_audio')
      .select('audio_url, provider')
      .eq('story_id', storyId)
      .maybeSingle()

    if (existingAudio?.audio_url) {
      // If provider matches requested provider, return existing audio
      if (!providerType || existingAudio.provider === providerType) {
        console.log(`Found existing audio for provider ${existingAudio.provider}: ${existingAudio.audio_url}`)
        return new Response(
          JSON.stringify({ audioUrl: existingAudio.audio_url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.log(`Found existing audio for different provider (${existingAudio.provider}), regenerating with ${providerType}`)
        // Continue to regenerate with new provider
      }
    }

    // No existing audio found or provider mismatch, generate new audio
    console.log(`Generating new audio with provider: ${providerType}`)
    
    try {
      // Fetch story content from database
      const story = await fetchStoryContent(storyId)
      
      // Generate audio using selected provider
      let audioBuffer;
      let selectedVoiceId;
      
      if (providerType === 'amazon-polly') {
        selectedVoiceId = voiceId || POLLY_VOICE_ID;
        console.log(`Calling Amazon Polly API with voice ID: ${selectedVoiceId}`)
        audioBuffer = await generateAudioPolly(story, selectedVoiceId)
      } else {
        // Default to ElevenLabs
        selectedVoiceId = voiceId || ELEVENLABS_VOICE_ID;
        console.log(`Calling ElevenLabs API with voice ID: ${selectedVoiceId}`)
        audioBuffer = await generateAudioElevenLabs(story, selectedVoiceId)
      }
      
      // Upload to Supabase Storage
      const filename = `${storyId}-${Date.now()}.mp3`
      const publicUrl = await uploadAudioFile(filename, audioBuffer)
      
      // Save audio metadata
      await saveAudioMetadata(storyId, publicUrl, selectedVoiceId, providerType)
  
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
