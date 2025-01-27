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
      if (process.env.NODE_ENV === 'development') {
        // Disable posthog in development
        posthog.opt_out_capturing()
      }
    },
    capture_pageview: false, // Disable automatic pageview capture
    autocapture: false, // Disable automatic event capture
  })
} catch (error) {
  console.warn('PostHog initialization failed:', error)
  // Continue app execution even if PostHog fails
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);