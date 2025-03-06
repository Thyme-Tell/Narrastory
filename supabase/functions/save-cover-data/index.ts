
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  console.log("Request received:", req.method, req.url);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get the request JSON
    let body;
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      console.error("Invalid content type:", contentType);
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    try {
      const text = await req.text();
      console.log("Request body (raw):", text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      body = JSON.parse(text);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: e.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const { profileId, coverData } = body;
    
    console.log("Received request to save cover data:", { 
      profileId, 
      coverDataType: typeof coverData,
      coverDataLength: coverData ? JSON.stringify(coverData).length : 0,
      coverDataSample: coverData ? JSON.stringify(coverData).substring(0, 50) + '...' : 'none'
    });
    
    if (!profileId) {
      console.error("Missing profileId");
      return new Response(
        JSON.stringify({ error: 'Missing profileId' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!coverData) {
      console.error("Missing coverData");
      return new Response(
        JSON.stringify({ error: 'Missing coverData' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Create a Supabase client with the service role key - no auth required
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      console.error("Missing SUPABASE_URL environment variable");
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing SUPABASE_URL' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!supabaseKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log("Creating Supabase client with URL:", supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if profile exists
    console.log("Checking if profile exists with ID:", profileId);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error checking profile:", profileError);
      return new Response(
        JSON.stringify({ error: 'Database error when checking profile', details: profileError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!profileData) {
      console.error("Profile not found for ID:", profileId);
      return new Response(
        JSON.stringify({ error: 'Invalid profile ID', profileId }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log('About to upsert cover data for profile:', profileId);
    
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
      return new Response(
        JSON.stringify({ error: 'Error saving cover data', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log('Cover data saved successfully:', data ? 'Data returned' : 'No data returned');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Cover data saved successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected server error', details: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
