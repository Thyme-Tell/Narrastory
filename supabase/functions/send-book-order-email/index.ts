import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    
    if (!profileId || !userEmail) {
      console.error('Missing required fields:', { profileId, userEmail });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    if (!LOOPS_API_KEY) {
      console.error('LOOPS_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Internal configuration error' 
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Could not fetch user profile');
    }

    console.log('Sending book order email with data:', { profileId, profile });

    // Send email using Loops - removing all contact properties
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: 'cm6f2c1qz023i125irpb4aq2u',
        email: userEmail,
        dataVariables: {
          profileId
        }
      }),
    });

    const responseData = await response.json();
    console.log('Loops API response:', responseData);

    if (!response.ok || !responseData.success) {
      console.error('Loops API error response:', responseData);
      throw new Error(responseData.message || 'Failed to send email');
    }

    console.log('Email sent successfully to:', userEmail);

    return new Response(
      JSON.stringify({ success: true }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});