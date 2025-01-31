import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pohnhzxqorelllbfnqyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG5oenhxb3JlbGxsYmZucXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Njk1MzAsImV4cCI6MjA1MzE0NTUzMH0.nG7V_e8Izqi-pXHw1HoaYAC4hediI0D9l_Qf9De93C0";

// Initialize PostHog with better error handling
const initPostHog = () => {
  try {
    // Only initialize PostHog in production
    if (process.env.NODE_ENV === 'production') {
      posthog.init('phc_Elh2xuN6zexUVDoZhrqZZsxRYpGSZln10MyhRKN4zwC', {
        api_host: 'https://us.i.posthog.com',
        loaded: (posthog) => {
          // Additional initialization if needed
          console.log('PostHog loaded successfully')
        },
        bootstrap: {
          distinctID: 'anonymous-user',
        },
        autocapture: false, // Disable automatic event capture
        capture_pageview: false, // Disable automatic pageview capture
        persistence: 'memory', // Use memory persistence to avoid localStorage issues
        advanced_disable_decide: true, // Disable decide endpoint calls which can fail
      })
    } else {
      // In development, create a mock PostHog instance
      console.log('PostHog disabled in development mode')
      posthog.opt_out_capturing()
    }
  } catch (error) {
    console.warn('PostHog initialization failed:', error)
    // Ensure PostHog is disabled if initialization fails
    try {
      posthog.opt_out_capturing()
    } catch {
      // Ignore any errors from opt_out_capturing
    }
  }
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'narra-auth-token',
    storage: localStorage, // Use localStorage directly
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
    retryAttempts: 3, // Retry failed auth requests
    persistSession: true, // Ensure session persistence is enabled
  },
  global: {
    headers: {
      'x-client-info': 'narra-web-app', // Add client info for better debugging
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Initialize PostHog
initPostHog();
