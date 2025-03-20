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
  // If phone number is null or undefined, return empty string
  if (!phoneNumber) {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number starts with '1' and has 11 digits, format with +1
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1${digitsOnly.slice(1)}`;
  }
  
  // If the number has 10 digits, add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If it already has a plus sign, return it as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Return the original format if it's already correct or we can't normalize it
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
    
    // Extract the caller's phone number from the Retell-specific format
    // According to the documentation, it's in the from_number field
    const callerPhoneNumber = payload.from_number;
                              
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
          user_name: "Guest User",
          user_email: "",
          user_id: "",
          user_first_name: "Guest",
          user_last_name: "User",
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
    
    // Format dynamic variables for Retell as per documentation
    const dynamicVariables = {
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
    
    console.log('Returning dynamic variables:', dynamicVariables);
    
    // Return the dynamic variables in the format expected by Retell
    return new Response(
      JSON.stringify(dynamicVariables),
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
