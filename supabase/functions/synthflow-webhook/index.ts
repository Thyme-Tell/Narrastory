
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
  console.log('Synthflow webhook received a request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    }
    
    console.log('Request payload:', JSON.stringify(payload));
    
    // Extract the caller's phone number from the Synthflow format
    // Assuming Synthflow sends the phone number in a field called 'phone' or 'caller_number'
    const callerPhoneNumber = payload.phone || payload.caller_number || payload.from || '';
                              
    if (!callerPhoneNumber) {
      console.error('No phone number provided in the webhook payload');
      return new Response(
        JSON.stringify({ 
          error: "No phone number provided",
          payload: payload 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Normalize the phone number for matching
    const normalizedCallerNumber = normalizePhoneNumber(callerPhoneNumber);
    console.log('Normalized caller number:', normalizedCallerNumber);
    
    // Find the user profile by phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, synthflow_voice_id, elevenlabs_voice_id')
      .eq('phone_number', normalizedCallerNumber)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error querying profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error querying profile', details: profileError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // If no profile found, return a default response
    if (!profile) {
      console.log('No profile found for phone number:', normalizedCallerNumber);
      return new Response(
        JSON.stringify({
          user_name: "Guest",
          user_email: "",
          user_id: "",
          user_first_name: "Guest",
          user_last_name: "",
          has_stories: false,
          story_count: 0,
          recent_story_titles: "none"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    console.log('Found profile:', profile);
    
    // Get user's recent stories to reference in the call
    const { data: recentStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
    }
    
    console.log('Recent stories:', recentStories);
    
    // Format response for Synthflow with user info
    const userContext = {
      user_id: profile.id,
      user_name: `${profile.first_name} ${profile.last_name}`,
      user_email: profile.email,
      user_first_name: profile.first_name,
      user_last_name: profile.last_name,
      has_stories: recentStories && recentStories.length > 0,
      story_count: recentStories ? recentStories.length : 0,
      recent_story_titles: recentStories && recentStories.length > 0 
        ? recentStories.map((s: any) => s.title || 'Untitled story').join(', ')
        : 'none'
    };
    
    console.log('Returning user context:', userContext);
    
    // Return the user context in the format expected by Synthflow
    return new Response(
      JSON.stringify(userContext),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing Synthflow webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
