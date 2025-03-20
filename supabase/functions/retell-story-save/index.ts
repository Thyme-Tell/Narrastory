
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main server function
Deno.serve(async (req) => {
  console.log('Retell story save endpoint received a request');
  
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
    const { profile_id, story_content, call_id, user_id, metadata } = payload;
    
    // Get the profile ID either directly or from metadata/dynamic variables
    let finalProfileId = profile_id;
    
    // If no profile_id, try to get it from metadata
    if (!finalProfileId && metadata && metadata.user_id) {
      finalProfileId = metadata.user_id;
    }
    
    // If still no profile_id, try to get it from call data via Retell API
    if (!finalProfileId && call_id) {
      try {
        const callData = await fetchCallDetails(call_id);
        if (callData && callData.retell_llm_dynamic_variables && callData.retell_llm_dynamic_variables.user_id) {
          finalProfileId = callData.retell_llm_dynamic_variables.user_id;
        } else if (callData && callData.metadata && callData.metadata.user_id) {
          finalProfileId = callData.metadata.user_id;
        }
      } catch (error) {
        console.error('Error fetching call details:', error);
      }
    }
    
    if (!finalProfileId || !story_content) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

// Function to fetch call details from Retell API
async function fetchCallDetails(callId: string) {
  try {
    const response = await fetch(`https://api.retellai.com/v1/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch call details: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw error;
  }
}
