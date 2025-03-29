
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get Synthflow webhook URL from environment variable or use the default
const SYNTHFLOW_WEBHOOK_URL = Deno.env.get('SYNTHFLOW_WEBHOOK_URL') || 'https://workflow.synthflow.ai/api/v1/webhooks/PnhLacw4fc58JJlHzm3r2';
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
    console.log(`Initiating direct call to ${normalizedPhone}`);
    
    // Prepare webhook data
    const webhookData = {
      phoneNumber: normalizedPhone,
      timestamp: new Date().toISOString(),
      source: 'narra-app'
    };
    
    console.log(`Using webhook URL: ${SYNTHFLOW_WEBHOOK_URL}`);
    console.log(`Using campaign ID: ${SYNTHFLOW_CAMPAIGN_ID}`);
    console.log(`Sending webhook payload: ${JSON.stringify(webhookData)}`);
    
    // First try the direct API call method
    try {
      console.log(`Making API call to: https://api.synthflow.ai/api/v1/call`);
      
      const callPayload = {
        phone: normalizedPhone,
        campaignId: SYNTHFLOW_CAMPAIGN_ID,
        webhookUrl: SYNTHFLOW_WEBHOOK_URL,
        webhookData: webhookData
      };
      
      console.log(`With body: ${JSON.stringify(callPayload)}`);
      
      const response = await fetch('https://api.synthflow.ai/api/v1/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callPayload),
      });
      
      console.log(`Synthflow API response status: ${response.status}`);
      const responseBody = await response.text();
      console.log(`Synthflow API response body: ${responseBody}`);
      
      if (!response.ok) {
        console.error(`Synthflow API error: ${responseBody}`);
        
        // Try backup method - direct campaign call
        console.log(`Trying backup method with campaigns endpoint...`);
        
        console.log(`Making backup API call to: https://api.synthflow.ai/api/v1/campaigns/${SYNTHFLOW_CAMPAIGN_ID}/call`);
        
        const backupPayload = {
          to: normalizedPhone,
          variables: webhookData
        };
        
        console.log(`With body: ${JSON.stringify(backupPayload)}`);
        
        const backupResponse = await fetch(`https://api.synthflow.ai/api/v1/campaigns/${SYNTHFLOW_CAMPAIGN_ID}/call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backupPayload),
        });
        
        console.log(`Backup API response status: ${backupResponse.status}`);
        const backupResponseBody = await backupResponse.text();
        console.log(`Backup API response body: ${backupResponseBody}`);
        
        if (!backupResponse.ok) {
          // If both direct methods fail, return URL for client-side redirection as fallback
          return new Response(
            JSON.stringify({ 
              success: true, 
              redirectUrl: `${SYNTHFLOW_WEBHOOK_URL.replace('/api/v1/webhooks/', '/forms/')}?Phone=${encodeURIComponent(normalizedPhone)}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // If we reach here, one of the direct call methods succeeded
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call initiated successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error calling Synthflow API:', error);
      
      // Return the URL for client-side redirection as fallback
      return new Response(
        JSON.stringify({ 
          success: true, 
          redirectUrl: `${SYNTHFLOW_WEBHOOK_URL.replace('/api/v1/webhooks/', '/forms/')}?Phone=${encodeURIComponent(normalizedPhone)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
