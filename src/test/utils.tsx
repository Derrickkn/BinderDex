import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of the default render from @testing-library/react
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Create a fresh QueryClient for each test to avoid state pollution
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Don't cache query results in tests
      },
      mutations: {
        retry: false, // Don't retry failed mutations in tests
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient }
}

/**
 * Create a QueryClient and wrapper for hook tests
 * Use this when you need to access queryClient before calling renderHook
 */
export function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Keep query data for the duration of the test
      },
      mutations: {
        retry: false,
      },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { queryClient, wrapper }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render with our custom version
export { renderWithProviders as render }
