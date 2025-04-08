
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Check Subscription Status Edge Function
 * 
 * Retrieves the current subscription status for a user
 * 
 * Request body:
 * - profileId: string (user profile ID)
 * - email: string (optional, user email)
 * - forceRefresh: boolean (optional, forces a fresh check with Stripe)
 * 
 * Response:
 * - hasSubscription: boolean
 * - isPremium: boolean
 * - isLifetime: boolean
 * - subscriptionData: object (subscription details)
 * - features: object (available features)
 */
serve(async (req) => {
  console.log("Check subscription function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse the request body
    const reqBody = await req.json();
    const { profileId, email, forceRefresh = false } = reqBody;

    // Validate inputs - need at least profileId or email
    if (!profileId && !email) {
      console.error('Missing profileId or email');
      return new Response(
        JSON.stringify({ error: 'Profile ID or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking subscription for ${profileId ? `profile: ${profileId}` : `email: ${email}`}`);
    
    // Step 1: First try to get subscription from database
    let userId = profileId;
    let subscriptionData = null;
    
    // If email is provided but not profileId, look up the profile
    if (!userId && email) {
      console.log(`Looking up profile ID for email: ${email}`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error looking up profile:', profileError);
        return new Response(
          JSON.stringify({ error: `Error looking up profile: ${profileError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (profileData) {
        userId = profileData.id;
        console.log(`Found profile ID: ${userId}`);
      } else {
        console.log(`No profile found for email: ${email}`);
        // Return default subscription status for non-subscribed users
        return new Response(
          JSON.stringify({
            hasSubscription: false,
            isPremium: false,
            isLifetime: false,
            subscriptionData: null,
            features: {
              // Default free-tier features
              storageLimit: 100,
              booksLimit: 1,
              collaboratorsLimit: 0,
              aiGeneration: false,
              customTTS: false,
              advancedEditing: false,
              prioritySupport: false
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Now get subscription data from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (dbError) {
      console.error('Error fetching subscription from database:', dbError);
      return new Response(
        JSON.stringify({ error: `Error fetching subscription: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    subscriptionData = dbSubscription;
    console.log(`Database subscription data:`, subscriptionData);
    
    // If forceRefresh or we need to verify with Stripe
    if (forceRefresh && subscriptionData && subscriptionData.stripe_subscription_id) {
      console.log(`Force refreshing subscription with Stripe`);
      
      // Initialize Stripe client
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || "", {
        apiVersion: '2023-10-16',
      });
      
      try {
        // Get the subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionData.stripe_subscription_id
        );
        
        console.log(`Stripe subscription status: ${stripeSubscription.status}`);
        
        // Update our database if the status has changed
        if (stripeSubscription.status !== subscriptionData.status) {
          console.log(`Updating subscription status from ${subscriptionData.status} to ${stripeSubscription.status}`);
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error(`Error updating subscription: ${updateError.message}`);
          } else {
            // Update the local subscription data with the new status
            subscriptionData.status = stripeSubscription.status;
            subscriptionData.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
            subscriptionData.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
          }
        }
      } catch (stripeError) {
        console.error(`Error refreshing Stripe subscription: ${stripeError.message}`);
        // Continue with the local data we have instead of failing
      }
    }
    
    // Determine subscription status
    const hasSubscription = !!subscriptionData;
    const isActiveStatus = subscriptionData?.status === 'active' || 
                          subscriptionData?.status === 'trialing';
    const isLifetime = subscriptionData?.is_lifetime || false;
    
    // A user has premium if they have an active subscription or lifetime access
    const isPremium = isLifetime || (hasSubscription && isActiveStatus);
    
    // Determine available features based on subscription plan
    let features = {
      // Default free-tier features
      storageLimit: 100,
      booksLimit: 1,
      collaboratorsLimit: 0,
      aiGeneration: false,
      customTTS: false,
      advancedEditing: false,
      prioritySupport: false
    };
    
    if (isPremium) {
      // Premium tier features
      features = {
        storageLimit: 5000,
        booksLimit: 10,
        collaboratorsLimit: 5,
        aiGeneration: true,
        customTTS: true,
        advancedEditing: true,
        prioritySupport: isLifetime // Lifetime members get priority support
      };
    }
    
    // Return the subscription status
    return new Response(
      JSON.stringify({
        hasSubscription,
        isPremium,
        isLifetime,
        subscriptionData,
        features,
        cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
        lastPaymentStatus: null, // Add this if you have payment history tracking
        purchaseDate: isLifetime ? subscriptionData?.lifetime_purchase_date : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
