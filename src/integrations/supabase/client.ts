import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";
import posthog from 'posthog-js';

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
          console.log('PostHog loaded successfully');
        },
        bootstrap: {
          distinctID: 'anonymous-user',
        },
        autocapture: false,
        capture_pageview: false,
        persistence: 'memory',
        advanced_disable_decide: true,
      });
    } else {
      console.log('PostHog disabled in development mode');
      posthog.opt_out_capturing();
    }
  } catch (error) {
    console.warn('PostHog initialization failed:', error);
    try {
      posthog.opt_out_capturing();
    } catch {
      // Ignore any errors from opt_out_capturing
    }
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'narra-auth-token',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: {
      'x-client-info': 'narra-web-app',
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