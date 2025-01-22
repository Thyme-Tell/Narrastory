import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import App from './App.tsx'
import './index.css'

// Initialize PostHog
posthog.init('phc_Elh2xuN6zexUVDoZhrqZZsxRYpGSZln10MyhRKN4zwC', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only'
})

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);