
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')
const SYNTHFLOW_API_URL = 'https://api.synthflow.com/v1'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json()
    console.log('Received text for synthesis:', text);

    if (!text) {
      console.error('No text provided');
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!SYNTHFLOW_API_KEY) {
      console.error('SYNTHFLOW_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Synthflow API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Making request to Synthflow API');
    
    try {
      // Create request body
      const requestBody = {
        text,
        voice_id: 'en-US-Neural2-F',
        output_format: 'mp3',
      };
      console.log('Request body:', JSON.stringify(requestBody));

      // Create request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      };

      // Log the request URL
      console.log('Request URL:', `${SYNTHFLOW_API_URL}/synthesize`);

      // Make the request
      const response = await fetch(`${SYNTHFLOW_API_URL}/synthesize`, requestOptions);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Read response as text
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format',
            details: responseText
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502,
          }
        );
      }

      // Check if response was successful
      if (!response.ok) {
        console.error('API error response:', data);
        return new Response(
          JSON.stringify({ 
            error: 'Synthflow API error',
            details: data?.error || data?.message || `Status ${response.status}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502,
          }
        );
      }

      // Validate response data
      if (!data?.audio_url) {
        console.error('Missing audio_url in response:', data);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format',
            details: 'Missing audio_url in response'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502,
          }
        );
      }

      console.log('Successfully received audio URL:', data.audio_url);
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (error) {
      console.error('Request error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });

      return new Response(
        JSON.stringify({ 
          error: 'Network request failed',
          details: error.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error('Function error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
