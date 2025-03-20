
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main server function
Deno.serve(async (req) => {
  console.log('User profile lookup function received a request');
  
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
    
    // Extract the phone number from the request
    const phoneNumber = payload.phone_number || payload.phone || payload.caller_number || '';
                              
    if (!phoneNumber) {
      console.error('No phone number provided in the request payload');
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
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('Normalized phone number:', normalizedPhoneNumber);
    
    // Find the user profile by phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, synthflow_voice_id, elevenlabs_voice_id')
      .eq('phone_number', normalizedPhoneNumber)
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
    
    // If no profile found, return a not found response
    if (!profile) {
      console.log('No profile found for phone number:', normalizedPhoneNumber);
      
      // For Synthflow compatibility, return a guest user object instead of 404
      const guestUser = {
        user_name: "Guest",
        user_email: "",
        user_id: "",
        user_first_name: "Guest",
        user_last_name: "",
        has_stories: false,
        story_count: 0,
        recent_story_titles: "none",
        recent_story_summaries: "none"
      };
      
      return new Response(
        JSON.stringify({
          found: false,
          message: "No profile found for this phone number",
          synthflow_context: guestUser
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    console.log('Found profile:', profile);
    
    // Get user's recent stories
    const { data: recentStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, summary, content, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
    }
    
    console.log('Recent stories:', recentStories);
    
    // Format the response with user context and stories
    const userProfile = {
      found: true,
      profile: {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        synthflow_voice_id: profile.synthflow_voice_id,
        elevenlabs_voice_id: profile.elevenlabs_voice_id
      },
      stories: {
        count: recentStories ? recentStories.length : 0,
        has_stories: recentStories && recentStories.length > 0,
        recent: recentStories || []
      },
      // For Synthflow compatibility
      synthflow_context: {
        user_id: profile.id,
        user_name: `${profile.first_name} ${profile.last_name}`,
        user_first_name: profile.first_name,
        user_last_name: profile.last_name,
        user_email: profile.email || "",
        has_stories: recentStories && recentStories.length > 0,
        story_count: recentStories ? recentStories.length : 0,
        recent_story_titles: recentStories && recentStories.length > 0 
          ? recentStories.map((s) => s.title || 'Untitled story').join(', ')
          : 'none',
        recent_story_summaries: recentStories && recentStories.length > 0 
          ? recentStories.map((s) => s.summary || 'No summary available').join(', ')
          : 'none'
      }
    };
    
    console.log('Returning user profile data');
    
    // Return the user profile data with CORS headers
    return new Response(
      JSON.stringify(userProfile),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing user profile lookup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
