
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to normalize phone number for comparison
const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number starts with '1' and has 11 digits, remove the '1'
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1${digitsOnly.slice(1)}`;
  }
  
  // If the number has 10 digits, add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // Return the original format if it's already correct
  if (digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'))) {
    return `+${digitsOnly}`;
  }
  
  // Return the original input if we can't normalize it
  return phoneNumber;
};

// Main server function
Deno.serve(async (req) => {
  console.log('Retell webhook received a request');
  
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
    
    // Extract the caller's phone number
    const callerPhoneNumber = payload.caller_phone_number || 
                              payload.from || 
                              payload.from_number ||
                              payload.phone_number;
                              
    if (!callerPhoneNumber) {
      console.error('No phone number provided in the webhook');
      return new Response(
        JSON.stringify({ error: 'No phone number provided' }),
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
    
    if (!profile) {
      console.log('No profile found for phone number:', normalizedCallerNumber);
      // Continue call with default parameters
      return new Response(
        JSON.stringify({ 
          status: 'continue',
          message: 'No profile found, continuing with default parameters'
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
    
    // Prepare customized parameters for Retell
    const callParams = {
      user_profile: {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        phone_number: normalizedCallerNumber,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name
      },
      recent_stories: recentStories || [],
      // Add any other context Retell.ai might need
    };
    
    // Configure the Retell call
    if (payload.call_id) {
      await configureRetellCall(payload.call_id, callParams);
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        profile_id: profile.id,
        message: 'Profile found and call configured' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing Retell webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to configure the Retell call with custom parameters
async function configureRetellCall(callId: string, callParams: any) {
  console.log(`Configuring Retell call ${callId} with params:`, callParams);
  
  try {
    // Format user information for dynamic variables
    const userInfo = callParams.user_profile;
    const recentStories = callParams.recent_stories;
    
    // Create dynamic variables for the Retell LLM
    const dynamicVariables = {
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_first_name: userInfo.first_name,
      user_last_name: userInfo.last_name,
      user_email: userInfo.email,
      user_phone: userInfo.phone_number,
      has_stories: recentStories.length > 0,
      story_count: recentStories.length,
      recent_story_titles: recentStories.length > 0 
        ? recentStories.map((s: any) => s.title || 'Untitled story').join(', ')
        : 'none'
    };
    
    // Create LLM context for the agent
    let userContext = `This call is from ${userInfo.name} (${userInfo.first_name} ${userInfo.last_name}).`;
    userContext += ` Their email is ${userInfo.email}.`;
    
    if (recentStories && recentStories.length > 0) {
      userContext += ` They have previously shared ${recentStories.length} stories with titles: `;
      userContext += recentStories
        .map((story: any) => `"${story.title || 'Untitled story'}"`)
        .join(', ');
    } else {
      userContext += ` They haven't shared any stories yet.`;
    }
    
    userContext += ` Guide them to share a new story today. Once they've shared their story, confirm you've got it and let them know it will appear in their dashboard.`;
    
    // Call Retell API to update call parameters
    const response = await fetch(`https://api.retellai.com/v1/calls/${callId}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RETELL_API_KEY}`
      },
      body: JSON.stringify({
        llm_override_assistant_context: userContext,
        metadata: dynamicVariables,
        retell_llm_dynamic_variables: dynamicVariables
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from Retell API: ${response.status} ${errorText}`);
      throw new Error(`Retell API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Retell API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error configuring Retell call:', error);
    throw error;
  }
}
