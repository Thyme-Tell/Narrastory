
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";

/**
 * Check Subscription Edge Function
 * 
 * Checks a user's subscription status in the database and Stripe.
 * Always checks with Stripe directly, bypassing any local cache.
 * 
 * Request:
 * - profileId: string (user profile ID) - via query param or request body
 * - email: string (user email) - via query param or request body (takes precedence over profileId)
 * - forceRefresh: boolean (force a fresh check) - defaults to true
 * 
 * Response:
 * - hasSubscription: boolean (whether user has active subscription)
 * - isPremium: boolean (whether user has premium status)
 * - isLifetime: boolean (whether user has lifetime subscription)
 * - subscriptionData: object (full subscription data if available)
 * - features: object (subscription features based on plan type)
 */
serve(async (req) => {
  console.log("Check subscription function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client and Stripe
    const supabase = getSupabaseClient();
    const stripe = getStripeClient();

    // Parse the request body or query parameters
    const url = new URL(req.url);
    let profileId = url.searchParams.get('profileId');
    let email = url.searchParams.get('email');
    let forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    console.log(`Profile ID from query: ${profileId}, Email from query: ${email}, Force refresh: ${forceRefresh}`);

    // If identifiers not in query params, try to get from request body
    if (!profileId || !email || forceRefresh === undefined) {
      try {
        const body = await req.json();
        profileId = profileId || body.profileId;
        email = email || body.email;
        // Always set forceRefresh to true regardless of input
        forceRefresh = true;
        console.log(`Profile ID from body: ${profileId}, Email from body: ${email}, Force refresh: ${forceRefresh}`);
      } catch (e) {
        console.log("No request body or invalid JSON");
        // Still force refresh to true
        forceRefresh = true;
      }
    } else {
      // Always force refresh regardless of query param
      forceRefresh = true;
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

    // If we have a profileId, try to get any local subscription data
    let localSubscriptionData = null;
    let stripeCustomerId = null;

    if (profileId) {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profileId)
        .maybeSingle();

      if (subError) {
        console.log(`Error querying local subscription: ${subError.message}`);
      } else if (subData) {
        localSubscriptionData = subData;
        stripeCustomerId = subData.stripe_customer_id;
        console.log(`Found local subscription data for profile ${profileId}`);
      }
    }

    // Special handling for lifetime subscriptions in our database
    if (localSubscriptionData?.is_lifetime) {
      console.log(`User has a lifetime subscription in our database - returning active status`);
      
      // Determine purchase date
      const purchaseDate = localSubscriptionData.lifetime_purchase_date 
        ? new Date(localSubscriptionData.lifetime_purchase_date) 
        : (localSubscriptionData.created_at ? new Date(localSubscriptionData.created_at) : null);
        
      // Check if we have any payment records for this user
      let orderId = null;
      try {
        const { data: payments } = await supabase
          .from('book_purchases')
          .select('id')
          .eq('user_id', profileId)
          .eq('is_from_credits', false)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (payments && payments.length > 0) {
          orderId = payments[0].id;
        }
      } catch (paymentError) {
        console.error(`Error fetching payment records: ${paymentError.message}`);
      }
      
      // Get the features for lifetime plan
      const lifetimeFeatures = {
        storageLimit: 10000, // MB
        booksLimit: 50,
        collaboratorsLimit: 20,
        aiGeneration: true,
        customTTS: true,
        advancedEditing: true,
        prioritySupport: true
      };
      
      return successResponse({
        hasSubscription: true,
        isPremium: true,
        isLifetime: true,
        cancelAtPeriodEnd: false,
        lastPaymentStatus: 'succeeded',
        purchaseDate: purchaseDate,
        orderId: orderId,
        planType: 'lifetime',
        features: lifetimeFeatures,
        subscriptionData: localSubscriptionData,
      });
    }

    // If we don't have a Stripe customer ID yet but we have an email, try to find the customer in Stripe
    if (!stripeCustomerId && email) {
      try {
        console.log(`Looking up Stripe customer for email ${email}`);
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
          console.log(`Found Stripe customer ${stripeCustomerId} for email ${email}`);
        }
      } catch (stripeError) {
        console.error(`Error finding Stripe customer: ${stripeError.message}`);
      }
    }

    // If we have a Stripe customer ID, check for active subscriptions in Stripe
    let stripeSubscription = null;
    if (stripeCustomerId) {
      try {
        console.log(`Looking up subscriptions for Stripe customer ${stripeCustomerId}`);
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
          expand: ['data.items.data.price', 'data.items.data.price.product']
        });
        
        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
          console.log(`Found active Stripe subscription ${stripeSubscription.id}`);
          
          // If we have a profileId but the subscription isn't in our database or needs updating, add/update it
          if (profileId) {
            const price = stripeSubscription.items.data[0]?.price;
            let planType = 'monthly'; // Default to monthly for active subscriptions
            
            if (price) {
              // Try to determine plan type from the price
              if (price.recurring) {
                planType = price.recurring.interval === 'month' ? 'monthly' : 'annual';
              }
              
              // Also check the product metadata if available
              if (price.product && typeof price.product !== 'string') {
                if (price.product.metadata?.planType) {
                  planType = price.product.metadata.planType;
                }
              } else if (price.metadata?.planType) {
                planType = price.metadata.planType;
              }
            }
            
            console.log(`Storing/updating Stripe subscription data for profile ${profileId}, plan type: ${planType}`);
            
            try {
              // Use upsert to either insert or update the subscription record
              const { error: upsertError } = await supabase
                .from('subscriptions')
                .upsert({
                  user_id: profileId,
                  stripe_customer_id: stripeCustomerId,
                  stripe_subscription_id: stripeSubscription.id,
                  plan_type: planType,
                  status: stripeSubscription.status,
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                  book_credits: planType === 'annual' || planType === 'plus' ? 1 : 0,
                  is_lifetime: false,
                  cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });
                
              if (upsertError) {
                console.error(`Error saving subscription data: ${upsertError.message}`);
              } else {
                // Update our local reference to include the newly stored/updated data
                const { data: freshData } = await supabase
                  .from('subscriptions')
                  .select('*')
                  .eq('user_id', profileId)
                  .single();
                  
                if (freshData) {
                  localSubscriptionData = freshData;
                  console.log('Updated local subscription data reference');
                }
              }
            } catch (dbError) {
              console.error(`Database operation error: ${dbError.message}`);
            }
          }
        }
      } catch (stripeError) {
        console.error(`Error checking Stripe subscriptions: ${stripeError.message}`);
      }
    }

    // Now we have checked both our database and Stripe, determine the subscription status
    let hasActiveSubscription = false;
    let isPremium = false;
    let isLifetime = false;
    let planType = 'free';
    let status = null;
    let features = null;
    let cancelAtPeriodEnd = false;
    let expirationDate = null;
    let lastPaymentStatus = null;
    
    // If there's an active Stripe subscription, use that status
    if (stripeSubscription) {
      hasActiveSubscription = true;
      isPremium = true;
      planType = localSubscriptionData?.plan_type || 'monthly'; // Default to monthly for active subscriptions
      
      // Critical consistency check: If we have an active subscription but plan type is 'free', set it to 'monthly'
      if (planType === 'free') {
        planType = 'monthly';
        
        // Update the database to fix the inconsistency
        if (profileId) {
          console.log(`Fixing inconsistency: Active subscription has 'free' plan_type. Updating to 'monthly'`);
          try {
            await supabase
              .from('subscriptions')
              .update({ plan_type: planType, updated_at: new Date().toISOString() })
              .eq('user_id', profileId);
          } catch (updateError) {
            console.error(`Error fixing plan type inconsistency: ${updateError.message}`);
          }
        }
      }
      
      status = stripeSubscription.status;
      cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      expirationDate = new Date(stripeSubscription.current_period_end * 1000);
      lastPaymentStatus = 'succeeded'; // Assume success for active subscriptions
    }
    // Otherwise, if we have local data, use that
    else if (localSubscriptionData) {
      if (localSubscriptionData.status === 'active' || localSubscriptionData.status === 'trialing') {
        hasActiveSubscription = true;
        isPremium = true;
        
        // Fix for inconsistency: ensure plan type is not 'free' if isPremium is true
        if (localSubscriptionData.plan_type === 'free' && isPremium) {
          // If we have an active subscription but plan type is 'free', update to 'monthly'
          planType = 'monthly';
          
          // Update the database with the corrected plan type
          if (profileId) {
            console.log(`Fixing inconsistency: Active subscription has 'free' plan_type. Updating to 'monthly'`);
            try {
              await supabase
                .from('subscriptions')
                .update({ plan_type: planType, updated_at: new Date().toISOString() })
                .eq('user_id', profileId);
            } catch (updateError) {
              console.error(`Error fixing plan type inconsistency: ${updateError.message}`);
            }
          }
        } else {
          planType = localSubscriptionData.plan_type;
        }
      } else {
        planType = localSubscriptionData.plan_type || 'free';
      }
      
      status = localSubscriptionData.status;
      cancelAtPeriodEnd = localSubscriptionData.cancel_at_period_end || false;
      if (localSubscriptionData.current_period_end) {
        expirationDate = new Date(localSubscriptionData.current_period_end);
      }
      lastPaymentStatus = localSubscriptionData.last_payment_status || 'succeeded';
    }
    
    // Final consistency check - isPremium should never be true with planType 'free'
    if (isPremium && planType === 'free') {
      console.log(`Final consistency check: Premium user has 'free' plan type. Setting to 'monthly' as default.`);
      planType = 'monthly';
      
      // Update the database if needed
      if (profileId) {
        try {
          await supabase
            .from('subscriptions')
            .update({ plan_type: planType, updated_at: new Date().toISOString() })
            .eq('user_id', profileId);
        } catch (updateError) {
          console.error(`Error fixing final plan type inconsistency: ${updateError.message}`);
        }
      }
    }
    
    // Set features based on plan type
    switch (planType) {
      case 'monthly':
        features = {
          storageLimit: 1000, // MB
          booksLimit: 5,
          collaboratorsLimit: 3,
          aiGeneration: true,
          customTTS: true,
          advancedEditing: true,
          prioritySupport: false
        };
        break;
      case 'annual':
      case 'plus': // Legacy plan name
        features = {
          storageLimit: 5000, // MB
          booksLimit: 20,
          collaboratorsLimit: 10,
          aiGeneration: true,
          customTTS: true,
          advancedEditing: true,
          prioritySupport: true
        };
        break;
      case 'lifetime':
        features = {
          storageLimit: 10000, // MB
          booksLimit: 50,
          collaboratorsLimit: 20,
          aiGeneration: true,
          customTTS: true,
          advancedEditing: true,
          prioritySupport: true
        };
        break;
      default:
        features = {
          storageLimit: 100, // MB
          booksLimit: 0,
          collaboratorsLimit: 0,
          aiGeneration: false,
          customTTS: false,
          advancedEditing: false,
          prioritySupport: false
        };
    }

    console.log(`Final subscription status: hasActive=${hasActiveSubscription}, isPremium=${isPremium}, plan=${planType}`);

    // Return the final subscription status
    return successResponse({
      hasSubscription: hasActiveSubscription,
      isPremium: isPremium,
      isLifetime: isLifetime,
      planType: planType,
      status: status,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      expirationDate: expirationDate,
      features: features,
      lastPaymentStatus: lastPaymentStatus,
      subscriptionData: localSubscriptionData || stripeSubscription,
    });
  } catch (error) {
    console.error(`Error in check-subscription: ${error.message}`);
    return errorResponse(`Error checking subscription: ${error.message}`, 500);
  }
});

// Helper function to get Stripe client
function getStripeClient() {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Missing Stripe secret key in environment variables');
  }

  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
}
