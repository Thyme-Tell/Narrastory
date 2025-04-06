
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";

/**
 * Check Subscription Edge Function
 * 
 * Checks a user's subscription status in the database and Stripe.
 * 
 * Request:
 * - profileId: string (user profile ID) - via query param or request body
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
    // Parse the request body or query parameters
    const url = new URL(req.url);
    let profileId = url.searchParams.get('profileId');
    console.log(`Profile ID from query: ${profileId}`);

    // If profile ID not in query params, try to get from request body
    if (!profileId) {
      try {
        const body = await req.json();
        profileId = body.profileId;
        console.log(`Profile ID from body: ${profileId}`);
      } catch (e) {
        console.log("No request body or invalid JSON");
      }
    }

    if (!profileId) {
      return errorResponse('Profile ID is required', 400);
    }

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Query the subscriptions table
    console.log(`Checking subscription for profile ID: ${profileId}`);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (error) {
      console.log(`No subscription found: ${error.message}`);
      // No subscription found, but this isn't an error
      return successResponse({ 
        hasSubscription: false,
        isPremium: false,
        isLifetime: false,
        subscriptionData: null,
        features: {
          storageLimit: 100, // MB
          booksLimit: 0,
          collaboratorsLimit: 0,
          aiGeneration: false,
          customTTS: false,
          advancedEditing: false,
          prioritySupport: false
        },
        message: 'No subscription found' 
      });
    }

    // Special handling for lifetime subscriptions - they are always considered active
    if (data.is_lifetime) {
      console.log(`User ${profileId} has a lifetime subscription - marking as active`);
      
      // If the status isn't active, update it
      if (data.status !== 'active') {
        console.log(`Updating lifetime subscription status from ${data.status} to active`);
        
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('user_id', profileId);
          
        if (updateError) {
          console.error(`Error updating lifetime subscription status: ${updateError.message}`);
        } else {
          // Update the local data object to reflect the change
          data.status = 'active';
        }
      }
      
      // Determine purchase date
      const purchaseDate = data.lifetime_purchase_date 
        ? new Date(data.lifetime_purchase_date) 
        : (data.created_at ? new Date(data.created_at) : null);
        
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
      
      // Lifetime subscriptions are always active and premium
      return successResponse({
        hasSubscription: true,
        isPremium: true,
        isLifetime: true,
        cancelAtPeriodEnd: false,
        lastPaymentStatus: 'succeeded',
        purchaseDate: purchaseDate,
        orderId: orderId,
        features: lifetimeFeatures,
        subscriptionData: data,
      });
    }
    
    // For non-lifetime subscriptions, check status normally
    const hasActiveSubscription = data && 
      (data.status === 'active' || data.status === 'trialing');
    
    const isLifetime = false; // We already handled lifetime above
    
    const isPremium = hasActiveSubscription;
    
    // Determine plan type and features
    const planType = data.plan_type || 'free';
    let features;
    
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
    
    // Get additional subscription details
    const cancelAtPeriodEnd = data.cancel_at_period_end || false;
    const purchaseDate = data.current_period_start ? new Date(data.current_period_start) : null;
    
    // Last payment status - ideally would come from Stripe but can default based on subscription status
    let lastPaymentStatus = 'succeeded';
    if (data.status === 'past_due' || data.status === 'unpaid') {
      lastPaymentStatus = 'failed';
    } else if (data.status === 'incomplete') {
      lastPaymentStatus = 'pending';
    }

    console.log(`Subscription status for ${profileId}: hasActive=${hasActiveSubscription}, isLifetime=${isLifetime}, isPremium=${isPremium}, plan=${planType}`);

    // Return subscription status
    return successResponse({
      hasSubscription: hasActiveSubscription,
      isPremium: isPremium,
      isLifetime: isLifetime,
      planType: planType,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      purchaseDate: purchaseDate,
      features: features,
      lastPaymentStatus: lastPaymentStatus,
      subscriptionData: data || null,
    });
  } catch (error) {
    console.error(`Error in check-subscription: ${error.message}`);
    return errorResponse(`Error checking subscription: ${error.message}`, 500);
  }
});
