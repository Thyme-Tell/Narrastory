
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
    const response = await fetch(`${SYNTHFLOW_API_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: 'en-US-Neural2-F',
        output_format: 'mp3',
      }),
    })

    const responseText = await response.text()
    let data
    
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', responseText)
      throw new Error('Invalid response from Synthflow API')
    }

    if (!response.ok) {
      console.error('Synthflow API error:', data);
      throw new Error(data.error || data.message || 'Synthflow API error')
    }

    console.log('Successfully received response from Synthflow');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in synthflow function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
