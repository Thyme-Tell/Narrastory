
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseClient, errorResponse, successResponse } from "../_shared/stripe-utils.ts";

interface UsageData {
  profileId: string;
  featureType: 'call' | 'book' | 'minutes';
  amount: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track Usage Edge Function
 * 
 * Records usage of premium features for a user:
 * - call: Tracks call durations
 * - book: Decrements book credits
 * - minutes: Tracks minutes used for audio generation
 * 
 * Request body:
 * - profileId: string (user profile ID)
 * - featureType: 'call' | 'book' | 'minutes'
 * - amount: number (amount to track, e.g., minutes, credits)
 * - metadata: object (optional additional data)
 * 
 * Response:
 * - success: boolean (whether tracking was successful)
 * - remainingCredits: number (if applicable)
 */
serve(async (req) => {
  console.log("Track usage function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { profileId, featureType, amount, metadata = {} }: UsageData = await req.json();

    // Validate required fields
    if (!profileId) {
      return errorResponse('Profile ID is required', 400);
    }

    if (!featureType) {
      return errorResponse('Feature type is required', 400);
    }

    if (amount === undefined || amount === null) {
      return errorResponse('Amount is required', 400);
    }

    console.log(`Tracking usage for user ${profileId}: ${featureType}, amount: ${amount}`);

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Handle different feature types
    switch (featureType) {
      case 'call': {
        // Track call duration
        const { error } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: profileId,
            call_duration: amount,
            call_timestamp: new Date().toISOString(),
          });

        if (error) {
          console.error(`Error tracking call usage: ${error.message}`);
          return errorResponse(`Error tracking call usage: ${error.message}`, 500);
        }

        break;
      }

      case 'book': {
        // Decrement book credits
        // First, get the current subscription
        const { data: subscriptionData, error: fetchError } = await supabase
          .from('subscriptions')
          .select('book_credits')
          .eq('user_id', profileId)
          .single();

        if (fetchError) {
          console.error(`Error fetching subscription: ${fetchError.message}`);
          return errorResponse(`Error fetching subscription: ${fetchError.message}`, 500);
        }

        // Check if enough credits
        const currentCredits = subscriptionData?.book_credits || 0;
        if (currentCredits < amount) {
          console.error(`Insufficient credits: ${currentCredits} < ${amount}`);
          return errorResponse('Insufficient book credits', 400);
        }

        // Update credits
        const newCredits = currentCredits - amount;
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ book_credits: newCredits })
          .eq('user_id', profileId);

        if (updateError) {
          console.error(`Error updating book credits: ${updateError.message}`);
          return errorResponse(`Error updating book credits: ${updateError.message}`, 500);
        }

        // Record book purchase from credits
        const { error: insertError } = await supabase
          .from('book_purchases')
          .insert({
            user_id: profileId,
            is_from_credits: true,
            ...(metadata.bookId && { book_id: metadata.bookId }),
          });

        if (insertError) {
          console.error(`Error recording book purchase: ${insertError.message}`);
          // Continue despite error as credits were already deducted
        }

        console.log(`Updated book credits for user ${profileId}: ${currentCredits} -> ${newCredits}`);
        return successResponse({ 
          success: true, 
          remainingCredits: newCredits 
        });
      }

      case 'minutes': {
        // Track minutes used
        const { data: subscriptionData, error: fetchError } = await supabase
          .from('subscriptions')
          .select('minutes_used')
          .eq('user_id', profileId)
          .single();

        if (fetchError) {
          console.error(`Error fetching subscription: ${fetchError.message}`);
          return errorResponse(`Error fetching subscription: ${fetchError.message}`, 500);
        }

        // Update minutes used
        const currentMinutes = subscriptionData?.minutes_used || 0;
        const newMinutes = currentMinutes + amount;
        
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ minutes_used: newMinutes })
          .eq('user_id', profileId);

        if (updateError) {
          console.error(`Error updating minutes used: ${updateError.message}`);
          return errorResponse(`Error updating minutes used: ${updateError.message}`, 500);
        }

        console.log(`Updated minutes used for user ${profileId}: ${currentMinutes} -> ${newMinutes}`);
        break;
      }

      default:
        return errorResponse(`Unknown feature type: ${featureType}`, 400);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error(`Error in track-usage: ${error.message}`);
    return errorResponse(`Error tracking usage: ${error.message}`, 500);
  }
});
