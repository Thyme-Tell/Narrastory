
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LUMA_API_KEY = Deno.env.get("LUMA_API_KEY");
const LUMA_API_ENDPOINT = "https://api.lu.ma/public/v1/calendar/events";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!LUMA_API_KEY) {
      throw new Error("LUMA_API_KEY is not configured");
    }

    console.log("Fetching events from Lu.ma API...");
    
    // Fetch events from Lu.ma API
    const response = await fetch(LUMA_API_ENDPOINT, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LUMA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lu.ma API error (${response.status}):`, errorText);
      throw new Error(`Lu.ma API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Log success for debugging
    console.log(`Successfully fetched ${data.events?.length || 0} events from Lu.ma`);

    // Return events to the client
    return new Response(JSON.stringify({ events: data.events || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching Lu.ma events:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to fetch events from Lu.ma",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
