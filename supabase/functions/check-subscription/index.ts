
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient as getSupabaseClient } from "../_shared/supabase-client.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";

// Create Stripe client
const getStripeClient = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    throw new Error('Missing Stripe secret key');
  }
  
  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
};

// Helper for error responses
const errorResponse = (message: string, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
};

// Helper for success responses
const successResponse = (data: any) => {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
};

// Get feature entitlements based on plan type
const getFeaturesByPlan = (planType: string) => {
  // Default features for free tier
  const freeFeatures = {
    storageLimit: 100,        // MB
    booksLimit: 0,            // No books in free tier
    collaboratorsLimit: 0,    // No collaborators in free tier
    aiGeneration: false,      // No AI generation
    customTTS: false,         // No custom TTS
    advancedEditing: false,   // No advanced editing
    prioritySupport: false    // No priority support
  };
  
  // Features for paid tiers
  switch (planType) {
    case 'plus':
    case 'annual':
      return {
        storageLimit: 2000,     // 2GB
        booksLimit: 5,          // 5 books
        collaboratorsLimit: 3,   // 3 collaborators
        aiGeneration: true,      // Includes AI generation
        customTTS: true,         // Includes custom TTS
        advancedEditing: true,   // Includes advanced editing
        prioritySupport: true    // Includes priority support
      };
    case 'monthly':
      return {
        storageLimit: 1000,     // 1GB
        booksLimit: 3,          // 3 books
        collaboratorsLimit: 1,   // 1 collaborator
        aiGeneration: true,      // Includes AI generation
        customTTS: true,         // Includes custom TTS
        advancedEditing: true,   // Includes advanced editing
        prioritySupport: false   // No priority support
      };
    case 'lifetime':
      return {
        storageLimit: 5000,     // 5GB
        booksLimit: 10,         // 10 books
        collaboratorsLimit: 5,   // 5 collaborators
        aiGeneration: true,      // Includes AI generation
        customTTS: true,         // Includes custom TTS
        advancedEditing: true,   // Includes advanced editing
        prioritySupport: true    // Includes priority support
      };
    default:
      return freeFeatures;
  }
};

/**
 * Check Subscription Edge Function
 * 
 * Checks a user's subscription status in the database and Stripe.
 */
serve(async (req) => {
  console.log("Check subscription function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    let stripe;
    
    try {
      stripe = getStripeClient();
    } catch (err) {
      console.log("Stripe client initialization failed, will continue without Stripe checks");
      // Continue without Stripe checks
    }

    // Parse the request body or query parameters
    const url = new URL(req.url);
    let profileId = url.searchParams.get('profileId');
    let email = url.searchParams.get('email');
    let forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    
    // If not in query params, try to get from request body
    if (!profileId || !email) {
      try {
        const body = await req.json();
        profileId = profileId || body.profileId;
        email = email || body.email;
        forceRefresh = forceRefresh || body.forceRefresh;
      } catch (e) {
        console.log("No request body or invalid JSON");
      }
    }

    // We need either a profileId or email to continue
    if (!profileId && !email) {
      return errorResponse('Either Profile ID or Email is required', 400);
    }

    // If we have email but no profileId, try to get profileId from the email
    if (email && !profileId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.log(`Error looking up profile by email: ${profileError.message}`);
      } else if (profileData) {
        profileId = profileData.id;
        console.log(`Found profile ID ${profileId} for email ${email}`);
      }
    }

    // Get subscription data from the database
    let subscriptionData = null;
    
    if (profileId) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profileId)
        .maybeSingle();
        
      if (error) {
        console.log(`Error fetching subscription: ${error.message}`);
      } else if (data) {
        subscriptionData = data;
        console.log(`Found subscription data: ${JSON.stringify(subscriptionData)}`);
      } else {
        console.log(`No subscription data found for profile ${profileId}`);
      }
    }
    
    // Default values
    let isPremium = false;
    let isLifetime = false;
    let hasActiveSubscription = false;
    let planType = 'free';
    let status = null;
    let cancelAtPeriodEnd = false;
    let lastPaymentStatus = null;
    let purchaseDate = null;
    let orderId = null;
    
    // If we have subscription data, determine the user's status
    if (subscriptionData) {
      // Set plan type from the database
      planType = subscriptionData.plan_type || 'free';
      
      // Check for lifetime subscription
      isLifetime = subscriptionData.is_lifetime || false;
      
      // Set subscription status
      status = subscriptionData.status || null;
      
      // If it's a lifetime subscription or has an active status, user has premium access
      if (isLifetime || 
          status === 'active' || 
          status === 'trialing' || 
          status === 'past_due') {
        isPremium = true;
        hasActiveSubscription = true;
      }
      
      // Set the purchase date for lifetime subscriptions
      if (isLifetime && subscriptionData.lifetime_purchase_date) {
        purchaseDate = subscriptionData.lifetime_purchase_date;
      }
      
      // Set cancel at period end if available
      cancelAtPeriodEnd = subscriptionData.cancel_at_period_end || false;
      
      // Set order ID if available (for tracking purchases)
      orderId = subscriptionData.stripe_subscription_id || null;
    }
    
    // Get features based on plan type
    const features = getFeaturesByPlan(planType);
    
    // Create response object
    const responseData = {
      hasSubscription: hasActiveSubscription,
      isPremium,
      isLifetime,
      planType,
      status,
      cancelAtPeriodEnd,
      expirationDate: subscriptionData?.current_period_end || null,
      features,
      lastPaymentStatus,
      purchaseDate,
      orderId,
      subscriptionData,
      bookCredits: subscriptionData?.book_credits || 0
    };
    
    console.log(`Final subscription status: hasActive=${hasActiveSubscription}, isPremium=${isPremium}, isLifetime=${isLifetime}, plan=${planType}`);
    
    return successResponse(responseData);
  } catch (err) {
    console.error(`Error checking subscription: ${err.message}`);
    return errorResponse(`Internal server error: ${err.message}`, 500);
  }
});
