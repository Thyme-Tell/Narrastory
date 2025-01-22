import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const synthflowApiKey = Deno.env.get('SYNTHFLOW_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the Synthflow API key
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${synthflowApiKey}`) {
      throw new Error('Unauthorized');
    }

    // Get the URL and parse query parameters
    const url = new URL(req.url);
    const phone_number = url.searchParams.get('phone_number');
    const generated_story = url.searchParams.get('generated_story');

    console.log('Received query parameters:', { phone_number, generated_story });

    if (!phone_number || !generated_story) {
      throw new Error('Missing required query parameters: phone_number and generated_story are required');
    }

    // Find the profile with the matching phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phone_number)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found for phone number: ${phone_number}`);
    }

    // Insert the story into the database
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([
        {
          profile_id: profile.id,
          content: generated_story,
        },
      ])
      .select()
      .single();

    if (storyError) {
      throw storyError;
    }

    console.log('Successfully stored story:', story);

    return new Response(
      JSON.stringify({ success: true, story }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400,
      }
    );
  }
});