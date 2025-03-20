
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get environment variables
const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main server function
Deno.serve(async (req) => {
  console.log('Synthflow story save endpoint received a request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const payload = await req.json();
    console.log('Request payload:', JSON.stringify(payload));
    
    // Extract necessary data from payload
    const { profile_id, phone_number, story_content, metadata } = payload;
    
    // Get the profile ID from phone number if provided
    let finalProfileId = profile_id;
    
    if (!finalProfileId && phone_number) {
      // Normalize the phone number for matching
      const normalizedPhoneNumber = normalizePhoneNumber(phone_number);
      
      // Look up profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', normalizedPhoneNumber)
        .maybeSingle();
        
      if (!profileError && profile) {
        finalProfileId = profile.id;
      }
    }
    
    // Try to get profile ID from metadata if still not found
    if (!finalProfileId && metadata && metadata.user_id) {
      finalProfileId = metadata.user_id;
    }
    
    if (!finalProfileId || !story_content) {
      console.error('Missing required fields in request', { finalProfileId, hasContent: !!story_content });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          fields_received: Object.keys(payload),
          profile_id_found: finalProfileId,
          content_length: story_content ? story_content.length : 0
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Process the story content
    const lines = story_content.split('\n').filter((line: string) => line.trim() !== '');
    // Use the first line as the title if it exists
    const title = lines.length > 0 ? lines[0].trim() : 'Phone Call Story';
    // Use the rest as the content
    const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : story_content;
    
    console.log('Processed story:', { title, content: content.substring(0, 100) + '...' });
    
    // Insert the story into the database
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([
        {
          profile_id: finalProfileId,
          title: title,
          content: content,
        },
      ])
      .select()
      .single();
      
    if (storyError) {
      console.error('Error inserting story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Error saving story', details: storyError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Successfully stored story:', story.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        story_id: story.id,
        message: 'Story successfully saved' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing story save:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
