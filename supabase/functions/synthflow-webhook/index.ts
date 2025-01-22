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
  console.log('=== START OF REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting webhook request processing');
    
    // Parse URL and get parameters
    const url = new URL(req.url);
    console.log('Raw URL:', url.toString());
    
    // Get parameters directly from URL search params
    const phone_number = url.searchParams.get('phone_number');
    const generated_story = url.searchParams.get('generated_story');
    
    console.log('Received parameters:', { phone_number, generated_story });

    if (!phone_number || !generated_story) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          received: { phone_number, generated_story } 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Find the profile with the matching phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phone_number)
      .single();

    if (profileError) {
      console.error('Error finding profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error finding profile', details: profileError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!profile) {
      console.error('No profile found for phone number:', phone_number);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('Found profile:', profile);

    // Split the generated story into title and content
    const lines = generated_story.split('\n').filter(line => line.trim() !== '');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    console.log('Extracted title:', title);
    console.log('Extracted content:', content);

    // Insert the story into the database with title and content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([
        {
          profile_id: profile.id,
          title: title,
          content: content,
        },
      ])
      .select()
      .single();

    if (storyError) {
      console.error('Error inserting story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Error inserting story', details: storyError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
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
        status: 500,
      }
    );
  }
});