// Import necessary libraries
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { getUserProfileByEmail } from "../_shared/stripe-utils.ts";

// Handle subscription checkout completion
export async function handleSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
  console.log(`Processing subscription checkout: ${session.id}`);
  
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
  const profile = await getUserProfileByEmail(email, supabase);
  const userId = profile.id;
  
  console.log(`Found user profile for checkout: ${userId} with email ${email}`);
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log(`Retrieved Stripe subscription: ${subscriptionId}, status: ${subscription.status}`);
  
  // Get the plan type from the metadata or try to determine from the price
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  console.log(`Subscription price: ${price.id}, product: ${price.product}`);
  
  // Try to determine plan type from metadata or interval
  let planType = price.metadata?.planType;
  
  if (!planType) {
    // If no metadata, try to determine from the interval
    if (price.recurring) {
      planType = price.recurring.interval === 'month' ? 'monthly' : 'annual';
      console.log(`Determined plan type from interval: ${planType}`);
    } else {
      // Default to plus if we can't determine
      planType = 'plus';
      console.log(`Using default plan type: ${planType}`);
    }
  }
  
  console.log(`User ${userId} subscribed to plan: ${planType}`);
  
  // Update or create subscription record
  const { data, error: upsertError } = await supabase
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
        book_credits: planType === 'plus' || planType === 'annual' ? 1 : 0, // Give 1 book credit for annual plans
        is_lifetime: false
      },
      { onConflict: 'user_id' }
    );
    
  if (upsertError) {
    console.error(`Failed to update subscription: ${upsertError.message}`);
    throw new Error(`Failed to update subscription: ${upsertError.message}`);
  }
  
  console.log(`Successfully processed subscription checkout for user ${userId}, subscription data:`, data);
}

// Handle one-time payment
export async function handleOneTimePayment(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
  console.log(`Processing one-time payment: ${session.id}`);
  
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
  const profile = await getUserProfileByEmail(email, supabase);
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
}

// Update subscription details in database
export async function updateSubscriptionInDatabase(
  subscription: Stripe.Subscription,
  supabase: any,
  stripe: Stripe
) {
  console.log(`Updating subscription: ${subscription.id}`);
  
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
  const profile = await getUserProfileByEmail(email, supabase);
  const userId = profile.id;
  
  // Get the plan type from the metadata or try to determine from the price
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  
  // Try to determine plan type from metadata or interval
  let planType = price.metadata?.planType;
  
  if (!planType) {
    // If no metadata, try to determine from the interval
    if (price.recurring) {
      planType = price.recurring.interval === 'month' ? 'monthly' : 'annual';
    } else {
      // Default to plus if we can't determine
      planType = 'plus';
    }
  }
  
  console.log(`Updating subscription for user ${userId}, plan: ${planType}, status: ${subscription.status}`);
  
  // Update subscription record
  const { data, error: updateError } = await supabase
    .from('subscriptions')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    console.error(`Failed to update subscription: ${updateError.message}`);
    throw new Error(`Failed to update subscription: ${updateError.message}`);
  }
  
  console.log(`Successfully updated subscription for user ${userId}, subscription data:`, data);
}

// Handle subscription cancellation
export async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  console.log(`Processing subscription cancellation: ${subscription.id}`);
  
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id, is_lifetime')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error(`No subscription found for ID: ${subscription.id}`);
    return;
  }
  
  const userId = data[0].user_id;
  const isLifetime = data[0].is_lifetime;
  
  console.log(`Found subscription for user ${userId}, isLifetime: ${isLifetime}`);
  
  // Don't change status for lifetime subscriptions
  if (isLifetime) {
    console.log(`User ${userId} has a lifetime subscription - ignoring cancellation`);
    return;
  }
  
  console.log(`Canceling subscription for user ${userId}`);
  
  // Update the subscription status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    console.error(`Failed to update subscription status: ${updateError.message}`);
    throw new Error(`Failed to update subscription status: ${updateError.message}`);
  }
  
  console.log(`Successfully canceled subscription for user ${userId}`);
}

// Handle successful invoice payment
export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: any,
  stripe: Stripe
) {
  console.log(`Processing paid invoice: ${invoice.id}`);
  
  // Only process subscription invoices
  if (!invoice.subscription) {
    console.log("Not a subscription invoice, skipping");
    return;
  }
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id, book_credits, plan_type')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error(`No subscription found for ID: ${subscription.id}`);
    return;
  }
  
  const userId = data[0].user_id;
  let bookCredits = data[0].book_credits || 0;
  const planType = data[0].plan_type;
  
  // If this is a renewal, add book credits based on plan type
  if (invoice.billing_reason === 'subscription_cycle') {
    // Annual plans get more credits than monthly
    if (planType === 'annual' || planType === 'plus') {
      bookCredits += 1; // Add 1 book credit per billing cycle for annual plans
    } else if (planType === 'monthly') {
      // Monthly plans might get credits less frequently or fewer credits
      // For now, we'll add 1 credit every 3 months
      const { data: usageData } = await supabase
        .from('subscriptions')
        .select('current_period_start')
        .eq('user_id', userId)
        .single();
        
      if (usageData && usageData.current_period_start) {
        const lastPeriodStart = new Date(usageData.current_period_start);
        const now = new Date();
        const monthsDiff = (now.getFullYear() - lastPeriodStart.getFullYear()) * 12 + 
                          now.getMonth() - lastPeriodStart.getMonth();
                          
        if (monthsDiff % 3 === 0) {
          bookCredits += 1;
          console.log(`Adding book credit for monthly subscription after ${monthsDiff} months, new total: ${bookCredits}`);
        }
      }
    }
    
    console.log(`Adding book credit for renewal, new total: ${bookCredits}`);
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
    console.error(`Failed to update subscription after payment: ${updateError.message}`);
    throw new Error(`Failed to update subscription after payment: ${updateError.message}`);
  }
  
  console.log(`Successfully processed invoice payment for user ${userId}`);
}

// Handle failed payment
export async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  console.log(`Processing failed payment invoice: ${invoice.id}`);
  
  // Only process subscription invoices
  if (!invoice.subscription) {
    console.log("Not a subscription invoice, skipping");
    return;
  }
  
  // Find the subscription in our database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    console.error(`No subscription found for ID: ${invoice.subscription}`);
    return;
  }
  
  const userId = data[0].user_id;
  console.log(`Updating subscription status to past_due for user ${userId}`);
  
  // Update the subscription status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) {
    console.error(`Failed to update subscription after failed payment: ${updateError.message}`);
    throw new Error(`Failed to update subscription after failed payment: ${updateError.message}`);
  }
  
  console.log(`Successfully updated subscription status after failed payment for user ${userId}`);
}
