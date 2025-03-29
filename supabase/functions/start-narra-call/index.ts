
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

    const { Phone } = requestBody;
    
    if (!Phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number for consistency if needed
    const normalizedPhone = Phone.startsWith('+') ? Phone : normalizePhoneNumber(Phone);
    
    console.log(`Initiating direct call to ${normalizedPhone}`);
    console.log(`Using webhook URL: ${SYNTHFLOW_WEBHOOK_URL}`);
    console.log(`Using campaign ID: ${SYNTHFLOW_CAMPAIGN_ID}`);
    
    // Create the payload with metadata for tracking
    const webhookPayload = {
      phoneNumber: normalizedPhone,
      timestamp: new Date().toISOString(),
      source: "narra-app"
    };
    
    console.log(`Sending webhook payload: ${JSON.stringify(webhookPayload)}`);
    
    // Try using the campaigns endpoint first (more reliable)
    try {
      console.log(`Using campaigns endpoint with ID: ${SYNTHFLOW_CAMPAIGN_ID}`);
      
      const response = await fetch(`https://api.synthflow.ai/api/v1/campaigns/${SYNTHFLOW_CAMPAIGN_ID}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          variables: webhookPayload
        }),
      });
      
      console.log(`Synthflow API response status: ${response.status}`);
      const responseText = await response.text();
      console.log(`Synthflow API response body: ${responseText}`);
      
      if (!response.ok) {
        console.error('Synthflow API error:', responseText);
        throw new Error(`Synthflow API returned status ${response.status}: ${responseText}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call initiated successfully',
          details: responseText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Synthflow API error:', error);
      
      // Try backup method if the first one fails
      console.log('Trying backup method with campaigns endpoint...');
      
      try {
        const backupResponse = await fetch(`https://api.synthflow.ai/api/v1/campaigns/${SYNTHFLOW_CAMPAIGN_ID}/call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: normalizedPhone,
            variables: webhookPayload
          }),
        });
        
        console.log(`Backup API response status: ${backupResponse.status}`);
        const backupResponseText = await backupResponse.text();
        console.log(`Backup API response body: ${backupResponseText}`);
        
        if (!backupResponse.ok) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to initiate call through all available methods',
              details: backupResponseText
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Call initiated successfully via backup method',
            details: backupResponseText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (backupError) {
        console.error('Backup API call failed:', backupError);
        
        // Fall back to direct form submission - create a payload that matches form expectations
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'All API call methods failed. Use direct form submission instead.',
            originalError: error.message,
            backupError: backupError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('Error submitting phone number to Synthflow:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
