
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get the request JSON
    const { profileId, coverData } = await req.json();
    
    if (!profileId || !coverData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log('Received cover data for saving:', JSON.stringify(coverData, null, 2));
    
    // Preserve backgroundImage exactly as received - do not modify it
    console.log('Background image value:', coverData.backgroundImage);
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .maybeSingle();
      
    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'Invalid profile ID' }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log('About to upsert cover data for profile:', profileId);
    console.log('Cover data to save:', JSON.stringify(coverData, null, 2));
    
    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('book_covers')
      .upsert({
        profile_id: profileId,
        cover_data: coverData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'profile_id'
      });
      
    if (error) {
      console.error('Error saving cover data:', error);
      throw error;
    }
    
    // After saving, retrieve the saved data to confirm it saved correctly
    const { data: savedData, error: fetchError } = await supabase
      .from('book_covers')
      .select('cover_data, updated_at')
      .eq('profile_id', profileId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error verifying saved data:', fetchError);
      // Continue anyway since we did save successfully
    } else {
      console.log('Cover data saved and verified:', JSON.stringify(savedData?.cover_data, null, 2));
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cover data saved successfully',
        timestamp: new Date().toISOString(),
        data: savedData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
