import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')
const SYNTHFLOW_API_URL = 'https://api.synthflow.ai/v1'

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

    if (!response.ok) {
      const error = await response.text()
      console.error('Synthflow API error:', error);
      throw new Error(error)
    }

    const data = await response.json()
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})