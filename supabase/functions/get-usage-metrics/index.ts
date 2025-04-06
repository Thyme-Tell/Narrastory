
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";

/**
 * Get Usage Metrics Edge Function
 * 
 * Retrieves usage metrics for a user.
 * 
 * Request:
 * - profileId: string (user profile ID) - via query param or request body
 * 
 * Response:
 * - metrics: Usage metrics object
 */
serve(async (req) => {
  console.log("Get usage metrics function called");
  
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

    // Get the subscription for the user
    console.log(`Getting subscription for profile ID: ${profileId}`);
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profileId)
      .maybeSingle();

    if (subscriptionError) {
      console.error(`Error fetching subscription: ${subscriptionError.message}`);
      return errorResponse(`Error fetching subscription: ${subscriptionError.message}`, 500);
    }

    // Get story count
    const { count: storyCount, error: storyError } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (storyError) {
      console.error(`Error counting stories: ${storyError.message}`);
      return errorResponse(`Error counting stories: ${storyError.message}`, 500);
    }

    // Get book count
    const { count: bookCount, error: bookError } = await supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (bookError) {
      console.error(`Error counting books: ${bookError.message}`);
      return errorResponse(`Error counting books: ${bookError.message}`, 500);
    }

    // Determine quota limits based on plan type
    let quotaLimits = {
      stories: 10,
      books: 0,
      minutes: 30
    };

    if (subscription) {
      const isPremium = subscription.plan_type === 'plus' || subscription.plan_type === 'lifetime' || subscription.is_lifetime;
      
      if (isPremium) {
        quotaLimits = {
          stories: Infinity,
          books: Infinity,
          minutes: Infinity
        };
      }
    }

    // Prepare the metrics object
    const metrics = {
      storiesCreated: storyCount || 0,
      booksPublished: bookCount || 0,
      minutesUsed: subscription?.minutes_used || 0,
      lastUpdated: new Date().toISOString(),
      quotaLimits
    };

    console.log(`Returning usage metrics for profile ID: ${profileId}`);
    return successResponse({ metrics });
  } catch (error) {
    console.error(`Error in get-usage-metrics: ${error.message}`);
    return errorResponse(`Error retrieving usage metrics: ${error.message}`, 500);
  }
});
