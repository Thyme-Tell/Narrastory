
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getStripeClient, 
  getSupabaseClient, 
  errorResponse, 
  successResponse 
} from "../_shared/stripe-utils.ts";
import {
  handleSubscriptionCheckout,
  handleOneTimePayment,
  updateSubscriptionInDatabase,
  handleSubscriptionCancellation,
  handleInvoicePaid,
  handlePaymentFailed
} from "./handlers.ts";

/**
 * Stripe Webhook Edge Function
 * 
 * Processes Stripe webhook events:
 * - checkout.session.completed: Process successful checkouts
 * - customer.subscription.created/updated/deleted: Update subscription status
 * - invoice.paid: Handle successful payments
 * - invoice.payment_failed: Handle failed payments
 * 
 * Request:
 * - Stripe webhook event payload
 * - stripe-signature header for validation
 * 
 * Response:
 * - received: true on success
 */
serve(async (req) => {
  console.log("Stripe webhook function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return errorResponse('No signature provided', 400);
    }

    // Get the raw request body
    const body = await req.text();
    
    // Verify the webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return errorResponse('Stripe webhook secret not configured', 500);
    }

    // Construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
      return errorResponse(`Webhook signature verification failed: ${err.message}`, 400);
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
          console.log(`Processing subscription update: ${subscription.id}, status: ${subscription.status}`);
          await updateSubscriptionInDatabase(subscription, supabase, stripe);
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Processing subscription deletion: ${subscription.id}`);
          await handleSubscriptionCancellation(subscription, supabase);
          break;
        }
        
        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Processing paid invoice: ${invoice.id}`);
          await handleInvoicePaid(invoice, supabase, stripe);
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Processing failed payment invoice: ${invoice.id}`);
          await handlePaymentFailed(invoice, supabase);
          break;
        }
        
        default: {
          console.log(`Unhandled event type: ${event.type}`);
        }
      }
    } catch (err) {
      console.error(`Error processing webhook event: ${err.message}`);
      return errorResponse(`Error processing webhook event: ${err.message}`, 500);
    }

    // Return a 200 response
    console.log("Webhook processed successfully");
    return successResponse({ received: true });
  } catch (error) {
    console.error(`Unhandled error in webhook handler: ${error.message}`);
    return errorResponse(`Error handling webhook: ${error.message}`, 500);
  }
});
