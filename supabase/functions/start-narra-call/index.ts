
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get Synthflow webhook URL from environment variable or use the default
const SYNTHFLOW_WEBHOOK_URL = Deno.env.get('SYNTHFLOW_WEBHOOK_URL') || 'https://workflow.synthflow.ai/forms/PnhLacw4fc58JJlHzm3r2';
const SYNTHFLOW_CAMPAIGN_ID = Deno.env.get('SYNTHFLOW_CAMPAIGN_ID') || 'A_JREGdUO7LTUbL3jAEVXggim6VwkK2Tfa_YwzFYJX8';

// Main server function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Method ${req.method} not allowed. Only POST is supported.` 
        }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body. JSON parsing failed.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone } = requestBody;
    
    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number for consistency
    const normalizedPhone = phone.startsWith('+') ? phone : normalizePhoneNumber(phone);
    console.log(`Initiating call to ${normalizedPhone}`);
    
    // Return the URL for client-side redirection
    return new Response(
      JSON.stringify({ 
        success: true, 
        redirectUrl: `${SYNTHFLOW_WEBHOOK_URL}?Phone=${encodeURIComponent(normalizedPhone)}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
