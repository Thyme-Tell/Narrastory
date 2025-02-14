
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

    try {
      console.log('Preparing request to Synthflow API');
      
      // Create request using URLSearchParams to ensure proper URL encoding
      const url = new URL(`${SYNTHFLOW_API_URL}/synthesize`);
      console.log('Request URL:', url.toString());

      const requestInit = {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Deno/1.0'
        }),
        body: JSON.stringify({
          text,
          voice_id: 'en-US-Neural2-F',
          output_format: 'mp3'
        }),
        // Add Deno-specific TLS configuration
        //@ts-ignore - Deno specific property
        client: {
          keepAlive: false,
          http2: false
        }
      };

      console.log('Making request to Synthflow API');
      const response = await fetch(url.toString(), requestInit);
      console.log('Response received:', response.status);

      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      const responseText = await response.text();
      console.log('Response text length:', responseText.length);
      console.log('Response text preview:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format',
            details: `Failed to parse response: ${e.message}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502 
          }
        );
      }

      if (!response.ok) {
        console.error('API error:', data);
        return new Response(
          JSON.stringify({ 
            error: 'API error',
            details: data.error || data.message || `HTTP ${response.status}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status 
          }
        );
      }

      console.log('Processing successful response');
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } catch (fetchError) {
      console.error('Fetch error:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack
      });

      // Check for specific network errors
      const errorMessage = fetchError.message?.toLowerCase() || '';
      if (errorMessage.includes('certificate')) {
        return new Response(
          JSON.stringify({ 
            error: 'SSL/TLS Error',
            details: 'Failed to establish secure connection'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'API Connection Error',
          details: fetchError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502 
        }
      );
    }
  } catch (error) {
    console.error('Function error:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ 
        error: 'Server Error',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
