import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import posthog from 'posthog-js';

const supabaseUrl = 'https://pohnhzxqorelllbfnqyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG5oenhxb3JlbGxsYmZucXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTMwNDUsImV4cCI6MjAyMjQ2OTA0NX0.SOhTyXy_CDGQvGjY4YjGkJBgGYGafYG4Gu2-nGvmpvE';

// Initialize PostHog
const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init('phc_VcJVU6h3UqhRWbQkZ5xzVhciGMXF3WPLgVTwiBtaPpX', {
      api_host: 'https://app.posthog.com',
      persistence: 'localStorage',
      autocapture: false,
    });
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
});

// Initialize PostHog
initPostHog();