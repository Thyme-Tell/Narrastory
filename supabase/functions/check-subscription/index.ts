
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Parse the request body or query parameters
    const url = new URL(req.url);
    let profileId = url.searchParams.get('profileId');

    // If profile ID not in query params, try to get from request body
    if (!profileId) {
      try {
        const body = await req.json();
        profileId = body.profileId;
      } catch (e) {
        // No body or invalid JSON
      }
    }

    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Query the subscriptions table
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (error) {
      console.error('Error checking subscription:', error);
      return new Response(
        JSON.stringify({ 
          hasSubscription: false,
          isPremium: false,
          subscriptionData: null,
          message: 'No subscription found' 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Determine if user has an active premium subscription
    const hasActiveSubscription = data && 
      (data.status === 'active' || data.status === 'trialing');
    
    const isLifetime = data && data.is_lifetime === true;
    
    const isPremium = hasActiveSubscription || isLifetime;

    // Return subscription status
    return new Response(
      JSON.stringify({
        hasSubscription: hasActiveSubscription,
        isPremium: isPremium,
        isLifetime: isLifetime,
        subscriptionData: data || null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in check-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
