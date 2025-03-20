
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
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body with better error handling
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        const requestBodyPromise = req.text();
        const text = await requestBodyPromise;
        console.log('Request body raw:', text);
        
        if (!text || text.trim() === '') {
          console.log('Empty request body received');
          return new Response(
            JSON.stringify({ 
              error: "Empty request body",
              content_type: contentType
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        try {
          payload = JSON.parse(text);
          console.log('Parsed payload:', JSON.stringify(payload));
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          return new Response(
            JSON.stringify({ 
              error: "Invalid JSON in request body", 
              message: parseError.message,
              received_content: text.substring(0, 200) + (text.length > 200 ? '...' : '')
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        console.error('Unsupported content type:', contentType);
        return new Response(
          JSON.stringify({ 
            error: "Unsupported content type", 
            content_type: contentType 
          }),
          { 
            status: 415, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (bodyError) {
      console.error('Error reading request body:', bodyError);
      return new Response(
        JSON.stringify({ 
          error: "Error reading request body", 
          message: bodyError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Request payload:', JSON.stringify(payload));
    
    // Extract necessary data from payload
    const { profile_id, phone_number, story_content, metadata } = payload;
    
    // Get the profile ID from phone number if provided
    let finalProfileId = profile_id;
    
    if (!finalProfileId && phone_number) {
      console.log('Looking up profile by phone number:', phone_number);
      // Normalize the phone number for matching
      const normalizedPhoneNumber = normalizePhoneNumber(phone_number);
      console.log('Normalized phone number:', normalizedPhoneNumber);
      
      // Look up profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', normalizedPhoneNumber)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error looking up profile:', profileError);
      } else if (profile) {
        console.log('Found profile by phone number:', profile);
        finalProfileId = profile.id;
      } else {
        console.log('No profile found for phone number:', normalizedPhoneNumber);
      }
    }
    
    // Try to get profile ID from metadata if still not found
    if (!finalProfileId && metadata && metadata.user_id) {
      console.log('Using user_id from metadata:', metadata.user_id);
      finalProfileId = metadata.user_id;
    }
    
    if (!finalProfileId || !story_content) {
      console.error('Missing required fields in request', { 
        finalProfileId, 
        hasContent: !!story_content,
        content_length: story_content ? story_content.length : 0
      });
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
    
    console.log('Processed story:', { 
      title, 
      content_preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
    });
    
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
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
