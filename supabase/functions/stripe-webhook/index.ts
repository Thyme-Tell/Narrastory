
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
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

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    // Get the raw request body
    const body = await req.text();
    
    // Verify the webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    // Construct the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Handling ${event.type} event`);

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          // Handle subscription checkout completion
          await handleSubscriptionCheckout(session, supabase, stripe);
        } else if (session.mode === 'payment') {
          // Handle one-time payment (book purchase, lifetime subscription)
          await handleOneTimePayment(session, supabase, stripe);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionInDatabase(subscription, supabase, stripe);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription, supabase);
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, supabase, stripe);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabase);
        break;
      }
    }

    // Return a 200 response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

// Handle subscription checkout completion
async function handleSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
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
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
    
  if (error || !profiles || profiles.length === 0) {
    throw new Error(`No profile found for email: ${email}`);
  }
  
  const userId = profiles[0].id;
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Get the plan type from the metadata
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const planType = price.metadata?.planType || 'plus';
  
  // Update or create subscription record
  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        book_credits: planType === 'plus' ? 1 : 0, // Give 1 book credit for Plus plan
        is_lifetime: false
      },
      { onConflict: 'user_id' }
    );
    
  if (upsertError) {
    throw new Error(`Failed to update subscription: ${upsertError.message}`);
  }
}

// Handle one-time payment
async function handleOneTimePayment(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
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
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
    
  if (error || !profiles || profiles.length === 0) {
    throw new Error(`No profile found for email: ${email}`);
  }
  
  const userId = profiles[0].id;
  
  // Check the line items to determine what was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  
  for (const item of lineItems.data) {
    // Get the price details to check metadata
    const price = await stripe.prices.retrieve(item.price.id);
    const product = await stripe.products.retrieve(price.product as string);
    
    if (product.metadata.productType === 'one_time' && price.metadata?.planType === 'lifetime') {
      // Handle lifetime subscription
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            plan_type: 'lifetime',
            status: 'active',
            is_lifetime: true,
            lifetime_purchase_date: new Date().toISOString(),
            book_credits: 1 // Give 1 book credit for lifetime plan
          },
          { onConflict: 'user_id' }
        );
        
      if (upsertError) {
        throw new Error(`Failed to update lifetime subscription: ${upsertError.message}`);
      }
    } else if (product.metadata.productType === 'book') {
      // Handle book purchase
      const bookType = price.metadata?.bookType;
      const amountPaid = item.amount_total / 100; // Convert from cents to dollars
      
      // Record the book purchase
      const { error: insertError } = await supabase
        .from('book_purchases')
        .insert({
          user_id: userId,
          amount_paid: amountPaid,
          is_from_credits: false
        });
        
      if (insertError) {
        throw new Error(`Failed to record book purchase: ${insertError.message}`);
      }
    }
  }
}

// Update subscription details in database
async function updateSubscriptionInDatabase(
  subscription: Stripe.Subscription,
  supabase: any,
  stripe: Stripe
) {
  // Get the customer ID from the subscription
  const customerId = subscription.customer as string;
  
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
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
    
  if (error || !profiles || profiles.length === 0) {
    throw new Error(`No profile found for email: ${email}`);
  }
  
  const userId = profiles[0].id;
  
  // Get the plan type from the metadata
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const planType = price.metadata?.planType || 'plus';
  
  // Update subscription record
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    throw new Error(`Failed to update subscription: ${updateError.message}`);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error('No subscription found for ID:', subscription.id);
    return;
  }
  
  const userId = data[0].user_id;
  
  // Update the subscription status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    throw new Error(`Failed to update subscription status: ${updateError.message}`);
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: any,
  stripe: Stripe
) {
  // Only process subscription invoices
  if (!invoice.subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id, book_credits')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error('No subscription found for ID:', subscription.id);
    return;
  }
  
  const userId = data[0].user_id;
  let bookCredits = data[0].book_credits || 0;
  
  // If this is a renewal, add book credits
  if (invoice.billing_reason === 'subscription_cycle') {
    bookCredits += 1; // Add 1 book credit per billing cycle
  }
  
  // Update the subscription
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      book_credits: bookCredits,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    throw new Error(`Failed to update subscription after payment: ${updateError.message}`);
  }
}

// Handle failed payment
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Only process subscription invoices
  if (!invoice.subscription) return;
  
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error('No subscription found for ID:', invoice.subscription);
    return;
  }
  
  const userId = data[0].user_id;
  
  // Update the subscription status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    throw new Error(`Failed to update subscription after failed payment: ${updateError.message}`);
  }
}
