import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Initialize PostHog with error handling
try {
  posthog.init('phc_Elh2xuN6zexUVDoZhrqZZsxRYpGSZln10MyhRKN4zwC', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    loaded: (posthog) => {
      // Optional: Add success logging
      console.log('PostHog loaded successfully');
    },
    bootstrap: {
      distinctID: 'anonymous-user',
    },
    autocapture: false, // Disable autocapture if not needed
    capture_pageview: false, // Disable automatic pageview capture if not needed
  });
} catch (error) {
  // Log the error but don't let it crash the app
  console.warn('PostHog initialization failed:', error);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);