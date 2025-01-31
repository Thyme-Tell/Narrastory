import React from 'react'
import * as ReactDOM from 'react-dom/client'
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

// Initialize PostHog with better error handling
const initPostHog = () => {
  try {
    // Only initialize PostHog in production
    if (process.env.NODE_ENV === 'production') {
      posthog.init('phc_Elh2xuN6zexUVDoZhrqZZsxRYpGSZln10MyhRKN4zwC', {
        api_host: 'https://us.i.posthog.com',
        loaded: (posthog) => {
          console.log('PostHog loaded successfully')
        },
        bootstrap: {
          distinctID: 'anonymous-user',
        },
        autocapture: false,
        capture_pageview: false,
        persistence: 'memory',
        advanced_disable_decide: true,
      })
    } else {
      console.log('PostHog disabled in development mode')
      posthog.opt_out_capturing()
    }
  } catch (error) {
    console.warn('PostHog initialization failed:', error)
    try {
      posthog.opt_out_capturing()
    } catch {
      // Ignore any errors from opt_out_capturing
    }
  }
}

// Initialize PostHog
initPostHog()

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

const root = ReactDOM.createRoot(container)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)