
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const stripeClient = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    throw new Error('Missing Stripe secret key');
  }
  
  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
};

/**
 * Fetches user profile by email
 */
const getUserProfileByEmail = async (email: string) => {
  console.log(`Looking up profile for email: ${email}`);
  const supabase = supabaseClient();
  
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
};

/**
 * Handles subscription checkout completion
 */
const handleSubscriptionCheckout = async (session: Stripe.Checkout.Session) => {
  console.log(`Processing subscription checkout: ${session.id}`);
  
  const stripe = stripeClient();
  const supabase = supabaseClient();
  
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // Get the customer
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    throw new Error('Customer was deleted');
  }
  
  // Get the email address
  const email = customer.email;
  if (!email) {
    throw new Error('Customer has no email');
  }
  
  // Find the profile ID based on email
  const profile = await getUserProfileByEmail(email);
  const userId = profile.id;
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Get the plan type from the price
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const product = await stripe.products.retrieve(price.product as string);
  
  // Try to determine plan type from metadata
  let planType = product.metadata?.planType;
  
  if (!planType) {
    // If no metadata, try to determine from the interval
    if (price.recurring) {
      planType = price.recurring.interval === 'month' ? 'monthly' : 'annual';
    } else {
      // Default to plus if we can't determine
      planType = 'plus';
    }
  }
  
  console.log(`User ${userId} subscribed to plan: ${planType}`);
  
  // Update or create subscription record
  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        book_credits: planType === 'plus' || planType === 'annual' ? 1 : 0,
        is_lifetime: false
      },
      { onConflict: 'user_id' }
    );
    
  if (upsertError) {
    console.error(`Failed to update subscription: ${upsertError.message}`);
    throw new Error(`Failed to update subscription: ${upsertError.message}`);
  }
  
  console.log(`Successfully processed subscription checkout for user ${userId}`);
};

/**
 * Handles one-time payment
 */
const handleOneTimePayment = async (session: Stripe.Checkout.Session) => {
  console.log(`Processing one-time payment: ${session.id}`);
  
  const stripe = stripeClient();
  const supabase = supabaseClient();
  
  const customerId = session.customer as string;
  
  // Get the customer
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    throw new Error('Customer was deleted');
  }
  
  // Get the email address
  const email = customer.email;
  if (!email) {
    throw new Error('Customer has no email');
  }
  
  // Find the profile ID based on email
  const profile = await getUserProfileByEmail(email);
  const userId = profile.id;
  
  // Check the line items to determine what was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  console.log(`Processing ${lineItems.data.length} line items`);
  
  for (const item of lineItems.data) {
    // Get the price details to check metadata
    const price = await stripe.prices.retrieve(item.price.id);
    const product = await stripe.products.retrieve(price.product as string);
    
    if (product.metadata.productType === 'one_time' && price.metadata?.planType === 'lifetime') {
      // Handle lifetime subscription
      console.log(`Processing lifetime subscription for user ${userId}`);
      
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            plan_type: 'lifetime',
            status: 'active', // Lifetime subscriptions are always active
            is_lifetime: true,
            lifetime_purchase_date: new Date().toISOString(),
            book_credits: 1 // Give 1 book credit for lifetime plan
          },
          { onConflict: 'user_id' }
        );
        
      if (upsertError) {
        console.error(`Failed to update lifetime subscription: ${upsertError.message}`);
        throw new Error(`Failed to update lifetime subscription: ${upsertError.message}`);
      }
      
      console.log(`Successfully processed lifetime purchase for user ${userId}`);
    } else if (product.metadata.productType === 'book') {
      // Handle book purchase
      const bookType = price.metadata?.bookType;
      const amountPaid = item.amount_total / 100; // Convert from cents to dollars
      
      console.log(`Processing ${bookType} book purchase for user ${userId}, amount: $${amountPaid}`);
      
      // Record the book purchase
      const { error: insertError } = await supabase
        .from('book_purchases')
        .insert({
          user_id: userId,
          amount_paid: amountPaid,
          is_from_credits: false
        });
        
      if (insertError) {
        console.error(`Failed to record book purchase: ${insertError.message}`);
        throw new Error(`Failed to record book purchase: ${insertError.message}`);
      }
      
      console.log(`Successfully processed book purchase for user ${userId}`);
    }
  }
};

/**
 * Stripe Webhook Edge Function
 */
serve(async (req) => {
  console.log("Stripe webhook function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Stripe webhook secret not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get the raw request body
    const body = await req.text();
    
    // Initialize Stripe
    const stripe = stripeClient();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`Handling ${event.type} event with ID: ${event.id}`);

    // Process different event types
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`Processing completed checkout session: ${session.id}`);
          
          if (session.mode === 'subscription') {
            // Handle subscription checkout completion
            await handleSubscriptionCheckout(session);
          } else if (session.mode === 'payment') {
            // Handle one-time payment
            await handleOneTimePayment(session);
          }
          break;
        }
        
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Processing subscription update: ${subscription.id}, status: ${subscription.status}`);
          
          // Get the customer
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && customer.email) {
            const profile = await getUserProfileByEmail(customer.email);
            const supabase = supabaseClient();
            
            // Update subscription record
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', profile.id);
              
            if (updateError) {
              console.error(`Failed to update subscription: ${updateError.message}`);
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            
            console.log(`Successfully updated subscription for user ${profile.id}`);
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Processing subscription deletion: ${subscription.id}`);
          
          // Get the customer
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && customer.email) {
            const profile = await getUserProfileByEmail(customer.email);
            const supabase = supabaseClient();
            
            // Update subscription record
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', profile.id)
              .eq('is_lifetime', false); // Don't cancel lifetime subscriptions
              
            if (updateError) {
              console.error(`Failed to update subscription: ${updateError.message}`);
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            
            console.log(`Successfully canceled subscription for user ${profile.id}`);
          }
          break;
        }
        
        default: {
          console.log(`Unhandled event type: ${event.type}`);
        }
      }
    } catch (err) {
      console.error(`Error processing webhook event: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Error processing webhook event: ${err.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Return a 200 response
    console.log("Webhook processed successfully");
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error(`Unhandled error in webhook handler: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Error handling webhook: ${error.message}` }),
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
