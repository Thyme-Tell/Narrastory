
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
    
    try {
      if (contentType.includes('application/json')) {
        payload = await req.json();
      } else {
        const formData = await req.formData();
        payload = Object.fromEntries(formData.entries());
      }
      
      console.log('Request payload:', JSON.stringify(payload));
    } catch (parseError) {
      console.error('Error parsing request payload:', parseError);
      return new Response(
        JSON.stringify({ 
          found: false,
          error: "Error parsing request payload", 
          details: parseError.message,
          message: "Error parsing request payload"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract the phone number from the request
    const phoneNumber = payload?.phone_number || payload?.phone || payload?.caller_number || '';
                              
    if (!phoneNumber) {
      console.error('No phone number provided in the request payload');
      return new Response(
        JSON.stringify({ 
          found: false,
          message: "No phone number provided in the request"
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Normalize the phone number for matching
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('Normalized phone number:', normalizedPhoneNumber);
    
    // Find the user profile by phone number - using select() rather than maybeSingle()
    // to better handle potential multiple matches
    const { data: profilesData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, synthflow_voice_id, elevenlabs_voice_id, phone_number')
      .eq('phone_number', normalizedPhoneNumber);
      
    if (profileError) {
      console.error('Error querying profile:', profileError);
      return new Response(
        JSON.stringify({ 
          found: false,
          error: 'Error querying profile', 
          details: profileError.message,
          message: "Database error when looking up profile"
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // If no profile found or multiple profiles found (we'll take the first one in that case)
    if (!profilesData || profilesData.length === 0) {
      console.log('No profile found for phone number:', normalizedPhoneNumber);
      
      // For Synthflow compatibility, return a guest user object instead of 404
      const guestUser = {
        user_name: "Guest User",
        user_email: "",
        user_id: "",
        user_first_name: "Guest",
        user_last_name: "User",
        user_phone: normalizedPhoneNumber,
        has_stories: false,
        story_count: 0,
        recent_story_titles: "none",
        recent_story_summaries: "none",
        all_story_titles: "none"
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
    
    // If multiple profiles found, log a warning and use the first one
    if (profilesData.length > 1) {
      console.warn(`Multiple profiles (${profilesData.length}) found for phone number: ${normalizedPhoneNumber}. Using the first one.`);
    }
    
    // Get the profile from the results (first one if multiple)
    const profile = profilesData[0];
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
      // Continue with empty stories instead of failing
    }
    
    // Get all user's story titles for the expanded context
    const { data: allStories, error: allStoriesError } = await supabase
      .from('stories')
      .select('title')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });
      
    if (allStoriesError) {
      console.error('Error fetching all story titles:', allStoriesError);
      // Continue with empty stories instead of failing
    }
    
    // Get total story count
    const { count: totalStoryCount, error: countError } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id);
      
    if (countError) {
      console.error('Error fetching total story count:', countError);
      // Continue with 0 as default
    }
    
    const storiesArray = recentStories || [];
    const allStoriesArray = allStories || [];
    console.log('Recent stories count:', storiesArray.length);
    console.log('Total stories count:', totalStoryCount);
    console.log('All stories titles count:', allStoriesArray.length);
    
    // Make sure we have valid values for first_name and last_name
    const firstName = profile.first_name || "Guest";
    const lastName = profile.last_name || "User";
    
    // Format all story titles into a single string
    const allStoryTitles = allStoriesArray.length > 0
      ? allStoriesArray.map((s) => s.title || 'Untitled story').join(', ')
      : 'none';
    
    // Format the response with user context and stories
    const userProfile = {
      found: true,
      profile: {
        id: profile.id,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        email: profile.email || "",
        synthflow_voice_id: profile.synthflow_voice_id || "",
        elevenlabs_voice_id: profile.elevenlabs_voice_id || "",
        phone_number: profile.phone_number || ""
      },
      stories: {
        count: storiesArray.length,
        "total-count": totalStoryCount || 0,
        has_stories: storiesArray.length > 0,
        recent: storiesArray,
        all_titles: allStoryTitles
      },
      // For Synthflow compatibility
      synthflow_context: {
        user_id: profile.id,
        user_name: `${firstName} ${lastName}`.trim(),
        user_first_name: firstName,
        user_last_name: lastName,
        user_email: profile.email || "",
        user_phone: profile.phone_number || "",
        has_stories: storiesArray.length > 0,
        story_count: totalStoryCount || 0,
        recent_story_titles: storiesArray.length > 0 
          ? storiesArray.map((s) => s.title || 'Untitled story').join(', ')
          : 'none',
        recent_story_summaries: storiesArray.length > 0 
          ? storiesArray.map((s) => s.summary || 'No summary available').join(', ')
          : 'none',
        all_story_titles: allStoryTitles
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
      JSON.stringify({ 
        found: false,
        error: error.message,
        stack: error.stack,
        message: "Server error processing request"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
