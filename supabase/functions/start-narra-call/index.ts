
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get Synthflow credentials from environment variables
const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY') || '';
const SYNTHFLOW_WEBHOOK_URL = 'https://workflow.synthflow.ai/api/v1/webhooks/et8Cg0Wn3HmcRuKyv8rGN';

// Main server function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber } = await req.json();
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number for consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    console.log(`Initiating direct call to ${normalizedPhone}`);
    
    // Make direct call to Synthflow API
    const response = await fetch('https://api.synthflow.ai/api/v1/calls/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        transferOnError: false,
        webhook: SYNTHFLOW_WEBHOOK_URL
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Synthflow API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to start call', 
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const responseData = await response.json();
    
    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error initiating Narra call:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

