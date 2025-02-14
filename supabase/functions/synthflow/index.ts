
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Log request details (without sensitive info)
      const requestBody = {
        text,
        voice_id: 'en-US-Neural2-F',
        output_format: 'mp3',
      };
      console.log('Request body:', JSON.stringify(requestBody));

      // Make the request with fetch
      const response = await fetch(`${SYNTHFLOW_API_URL}/synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }).catch(error => {
        console.error('Fetch error:', error);
        throw error;
      });

      clearTimeout(timeoutId);

      if (!response) {
        throw new Error('No response received from Synthflow API');
      }

      console.log('Synthflow API response status:', response.status);
      
      // Read response as text first
      const responseText = await response.text().catch(error => {
        console.error('Error reading response text:', error);
        throw new Error('Failed to read response from Synthflow API');
      });
      
      console.log('Synthflow API raw response:', responseText);

      // Try to parse as JSON if we got a response
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid JSON response from Synthflow API');
      }

      if (!response.ok) {
        console.error('Synthflow API error response:', data);
        throw new Error(data?.error || data?.message || `Synthflow API error (${response.status})`);
      }

      if (!data || !data.audio_url) {
        console.error('Missing audio_url in response:', data);
        throw new Error('Invalid response format from Synthflow API');
      }

      console.log('Successfully received response from Synthflow');
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (fetchError) {
      console.error('Detailed fetch error:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack
      });

      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            error: 'Request timeout',
            details: 'The request to Synthflow API timed out after 30 seconds'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 504,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Synthflow API request failed',
          details: fetchError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error('Error in synthflow function:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
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
