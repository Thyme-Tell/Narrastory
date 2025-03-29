
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get Synthflow webhook URL from environment variable or use the default
const SYNTHFLOW_WEBHOOK_URL = Deno.env.get('SYNTHFLOW_WEBHOOK_URL') || 'https://workflow.synthflow.ai/forms/PnhLacw4fc58JJlHzm3r2';

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
    
    console.log(`Submitting phone number to Synthflow workflow: ${normalizedPhone}`);
    console.log(`Using webhook URL: ${SYNTHFLOW_WEBHOOK_URL}`);
    
    // Create the payload with the expected field name "Phone"
    const webhookPayload = {
      Phone: normalizedPhone
    };
    
    console.log(`Sending webhook payload: ${JSON.stringify(webhookPayload)}`);
    
    // Send the request directly to the Synthflow webhook
    const response = await fetch(SYNTHFLOW_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });
    
    // Log full response for debugging
    const responseText = await response.text();
    console.log(`Synthflow webhook response status: ${response.status}`);
    console.log(`Synthflow webhook response body: ${responseText}`);
    
    if (!response.ok) {
      console.error('Synthflow webhook error:', responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to submit phone number to Synthflow', 
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
      JSON.stringify({ 
        success: true, 
        message: 'Phone number submitted to Synthflow successfully',
        data: responseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error submitting phone number to Synthflow:', error);
    
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
