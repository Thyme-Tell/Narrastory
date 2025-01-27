import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookOrderRequest {
  profileId: string;
  userEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, userEmail } = await req.json() as BookOrderRequest;
    console.log('Received request:', { profileId, userEmail });
    
    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    if (!LOOPS_API_KEY) {
      throw new Error('LOOPS_API_KEY is not set');
    }

    const loopsPayload = {
      transactionalId: 'cm6f1iwei00hzr8a0co3pef2t',
      email: 'mia@narrastory.com',
      dataVariables: {
        userId: profileId,
        userEmail: userEmail || 'Not provided',
      },
    };

    console.log('Sending request to Loops with payload:', loopsPayload);

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify(loopsPayload),
    });

    const responseData = await response.text();
    console.log('Loops API response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseData,
    });

    if (!response.ok) {
      throw new Error(`Loops API error: ${response.status} ${response.statusText} - ${responseData}`);
    }

    return new Response(
      JSON.stringify({ success: true, response: responseData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error) {
    console.error('Error in send-book-order-email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  }
});