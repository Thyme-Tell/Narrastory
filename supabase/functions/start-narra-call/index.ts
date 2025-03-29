
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get Synthflow credentials from environment variables
const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY') || '1731942694898x268895289669069280';
const SYNTHFLOW_WEBHOOK_URL = Deno.env.get('SYNTHFLOW_WEBHOOK_URL') || 'https://workflow.synthflow.ai/api/v1/webhooks/PnhLacw4fc58JJlHzm3r2';
const SYNTHFLOW_CAMPAIGN_ID = Deno.env.get('SYNTHFLOW_CAMPAIGN_ID') || '1743253169176x907331148856824600';

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

    const { phoneNumber } = requestBody;
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number for consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    console.log(`Initiating direct call to ${normalizedPhone}`);
    console.log(`Using webhook URL: ${SYNTHFLOW_WEBHOOK_URL}`);
    console.log(`Using campaign ID: ${SYNTHFLOW_CAMPAIGN_ID}`);
    
    // Check if API key is available
    if (!SYNTHFLOW_API_KEY) {
      console.error('Missing SYNTHFLOW_API_KEY environment variable');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key configuration error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a payload that will be sent as rawBody to the webhook
    const webhookPayload = {
      phoneNumber: normalizedPhone,
      timestamp: new Date().toISOString(),
      source: 'narra-app'
    };
    
    console.log(`Sending webhook payload: ${JSON.stringify(webhookPayload)}`);
    
    // Try to use a direct API call that doesn't use the /campaigns/ path
    // The updated code now tries a different endpoint structure
    const url = 'https://api.synthflow.ai/api/v1/call';
    
    const body = {
      phone: normalizedPhone,
      campaignId: SYNTHFLOW_CAMPAIGN_ID,
      webhookUrl: SYNTHFLOW_WEBHOOK_URL,
      webhookData: webhookPayload
    };
    
    console.log(`Making API call to: ${url}`);
    console.log(`With body: ${JSON.stringify(body)}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Log full response for debugging
    const responseText = await response.text();
    console.log(`Synthflow API response status: ${response.status}`);
    console.log(`Synthflow API response body: ${responseText}`);
    
    if (!response.ok) {
      console.error('Synthflow API error:', responseText);
      
      // If the /api/v1/call endpoint fails, try a backup method with the /campaigns endpoint
      if (response.status === 404) {
        console.log('Trying backup method with campaigns endpoint...');
        
        const campaignsUrl = `https://api.synthflow.ai/api/v1/campaigns/${SYNTHFLOW_CAMPAIGN_ID}/call`;
        const campaignsBody = {
          to: normalizedPhone,
          variables: webhookPayload
        };
        
        console.log(`Making backup API call to: ${campaignsUrl}`);
        console.log(`With body: ${JSON.stringify(campaignsBody)}`);
        
        const backupResponse = await fetch(campaignsUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignsBody),
        });
        
        const backupResponseText = await backupResponse.text();
        console.log(`Backup API response status: ${backupResponse.status}`);
        console.log(`Backup API response body: ${backupResponseText}`);
        
        if (!backupResponse.ok) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to start call with both methods', 
              details: {
                primary: responseText,
                backup: backupResponseText
              },
              status: backupResponse.status
            }),
            { status: backupResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // If backup method succeeded, return that response
        let backupData;
        try {
          backupData = JSON.parse(backupResponseText);
        } catch (e) {
          backupData = { message: 'Response received but not valid JSON' };
        }
        
        return new Response(
          JSON.stringify({ success: true, data: backupData, method: 'backup' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If not a 404 or backup also failed, return the original error
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to start call', 
          details: responseText,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      responseData = { message: 'Response received but not valid JSON' };
    }
    
    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error initiating Narra call:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        errorObject: JSON.stringify(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
