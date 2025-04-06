
import { corsHeaders } from "./cors.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Initialize Stripe client
export function getStripeClient() {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Missing Stripe secret key in environment variables');
  }

  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
}

// Initialize Supabase client
export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Get user profile by email
export async function getUserProfileByEmail(email: string, supabase: any) {
  console.log(`Looking up profile for email: ${email}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
    
  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.error(`No profile found for email: ${email}`);
    throw new Error(`No profile found for email: ${email}`);
  }
  
  console.log(`Found profile with ID: ${data[0].id}`);
  return data[0];
}

// Standard error response
export function errorResponse(message: string, status = 500) {
  console.error(`Error: ${message}`);
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

// Standard success response
export function successResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

// Define common price IDs
export const PRICE_IDS = {
  ANNUAL_PLUS: Deno.env.get('STRIPE_ANNUAL_PLUS_PRICE_ID') || '',
  LIFETIME: Deno.env.get('STRIPE_LIFETIME_PRICE_ID') || '',
  FIRST_BOOK: Deno.env.get('STRIPE_FIRST_BOOK_PRICE_ID') || '',
  ADDITIONAL_BOOK: Deno.env.get('STRIPE_ADDITIONAL_BOOK_PRICE_ID') || '',
};
