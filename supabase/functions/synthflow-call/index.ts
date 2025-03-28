
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { normalizePhoneNumber } from "../_shared/phoneUtils.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle incoming requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { phoneNumber } = await req.json();
    console.log(`Received request to call phone number: ${phoneNumber}`);
    
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }
    
    // Normalize phone number to ensure consistent format
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    console.log(`Normalized phone number: ${normalizedPhone}`);
    
    // Synthflow API endpoint
    const synthflowUrl = Deno.env.get('SYNTHFLOW_API_URL');
    const synthflowApiKey = Deno.env.get('SYNTHFLOW_API_KEY');
    
    if (!synthflowUrl || !synthflowApiKey) {
      throw new Error("Synthflow configuration missing");
    }
    
    // Make request to Synthflow API
    const response = await fetch(synthflowUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${synthflowApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: normalizedPhone,
        agent_id: Deno.env.get('SYNTHFLOW_AGENT_ID')
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Synthflow API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to initiate call: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Call successfully initiated", data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Call has been initiated, you will receive a call shortly." 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error processing call request: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
