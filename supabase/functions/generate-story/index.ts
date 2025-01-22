import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    console.log('Calling Synthflow API with prompt:', prompt);

    const response = await fetch('https://api.synthflow.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Synthflow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Synthflow API response:', data);

    // Split the generated text into lines
    const lines = data.text.split('\n').filter(line => line.trim() !== '');
    
    // Extract title (first line) and content (remaining lines)
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    return new Response(JSON.stringify({ 
      title,
      content,
      raw: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});