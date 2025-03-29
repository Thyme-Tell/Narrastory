
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

    // Normalize phone number for consistency
    const normalizedPhone = Phone.startsWith('+') ? Phone : normalizePhoneNumber(Phone);
    
    console.log(`Initiating direct call to ${normalizedPhone}`);
    console.log(`Using direct form submission to: ${SYNTHFLOW_WEBHOOK_URL}`);
    
    // Create the payload for the Synthflow form
    const formData = new FormData();
    formData.append('Phone', normalizedPhone);
    
    console.log(`Sending form data with Phone: ${normalizedPhone}`);
    
    try {
      // Attempt direct form submission to Synthflow
      const formResponse = await fetch(SYNTHFLOW_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`Synthflow form response status: ${formResponse.status}`);
      
      if (formResponse.ok) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Call initiated successfully via direct form submission'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // If form submission fails, try API method as backup
        console.log('Form submission failed, trying API method...');
        return await tryAPIMethod(normalizedPhone, corsHeaders);
      }
    } catch (error) {
      console.error('Error with direct form submission:', error);
      // Try API method as backup
      return await tryAPIMethod(normalizedPhone, corsHeaders);
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

async function tryAPIMethod(normalizedPhone: string, corsHeaders: HeadersInit) {
  console.log('Trying API method as backup...');
  
  try {
    // Create the webhook payload
    const webhookPayload = {
      phoneNumber: normalizedPhone,
      timestamp: new Date().toISOString(),
      source: "narra-app"
    };
    
    console.log(`Using API endpoint with campaign ID: ${SYNTHFLOW_CAMPAIGN_ID}`);
    
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
    
    console.log(`API response status: ${response.status}`);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log(`API response body: ${responseText}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call initiated successfully via API',
          details: responseText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await response.text();
      console.error('API error:', errorText);
      
      // If both methods fail, return direct form submission details for client-side fallback
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'All server-side methods failed. Use client-side direct submission.',
          useDirectSubmission: true,
          formUrl: SYNTHFLOW_WEBHOOK_URL,
          phoneNumber: normalizedPhone
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API method error:', error);
    
    // If both methods fail, return direct form submission details for client-side fallback
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'All server-side methods failed. Use client-side direct submission.',
        useDirectSubmission: true,
        formUrl: SYNTHFLOW_WEBHOOK_URL,
        phoneNumber: normalizedPhone
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
