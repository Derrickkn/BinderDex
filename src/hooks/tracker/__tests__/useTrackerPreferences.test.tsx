import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useTrackerPreferences, preferencesKeys } from '../useTrackerPreferences'
import { useTrackerStore } from '@/hooks/useTrackerStore'
import { mockTrackerPreferences } from '@/test/mockData/trackerMocks'
import type { TrackerPreferences } from '@/lib/types/tracker'

// Mock server actions
vi.mock('@/lib/tracker/actions', () => ({
  getTrackerPreferences: vi.fn(),
  updateTrackerPreferences: vi.fn(),
}))

// Import mocked functions
import { getTrackerPreferences, updateTrackerPreferences } from '@/lib/tracker/actions'

describe('useTrackerPreferences', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    vi.clearAllMocks()

    // Create QueryClient before each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })

    // Create wrapper
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    // Reset Zustand store to initial state
    useTrackerStore.setState({
      currentPage: 0,
      selectedVariantId: null,
      isModalOpen: false,
      highlightedVariantId: null,
      preferences: {
        slotConfig: 'NINE',
        includePromos: false,
        includeReverseHolos: false,
        includePokeball: true,
        includeMasterball: true,
      },
    })
  })

  afterEach(() => {
    queryClient?.clear()
  })

  const setId = 'me1'

  it('loads preferences from server and syncs to store', async () => {
    const serverPreferences: TrackerPreferences = {
      slotConfig: 'TWELVE',
      includePromos: true,
      includeReverseHolos: true,
      includePokeball: false,
      includeMasterball: false,
    }

    vi.mocked(getTrackerPreferences).mockResolvedValue({
      data: serverPreferences,
      error: null,
    })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Preferences should be in query cache
    expect(result.current.data).toEqual(serverPreferences)

    // Preferences should also be synced to Zustand store
    const storePreferences = useTrackerStore.getState().preferences
    expect(storePreferences).toEqual(serverPreferences)
  })

  it('optimistically updates preferences in query cache and store', async () => {
    const initialPreferences = mockTrackerPreferences
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    vi.mocked(updateTrackerPreferences).mockResolvedValue({
      data: {},
      error: null,
    })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    // Wait for initial data to sync to store
    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Update preferences
    const newPreferences = { includePromos: false, includeReverseHolos: false }
    result.current.updatePreferences(newPreferences)

    // Should update Zustand store immediately
    const storePreferences = useTrackerStore.getState().preferences
    expect(storePreferences.includePromos).toBe(false)
    expect(storePreferences.includeReverseHolos).toBe(false)

    // Should also update query cache optimistically
    const cachedData = queryClient.getQueryData<TrackerPreferences>(
      preferencesKeys.set(setId)
    )
    expect(cachedData?.includePromos).toBe(false)
    expect(cachedData?.includeReverseHolos).toBe(false)

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isUpdating).toBe(false))
  })

  it('rolls back on server error', async () => {
    const initialPreferences = mockTrackerPreferences
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    // Mock server error
    vi.mocked(updateTrackerPreferences).mockResolvedValue({
      data: null,
      error: 'Update failed',
    })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Attempt to update
    result.current.updatePreferences({ slotConfig: 'SIXTEEN' })

    // Optimistic update applies
    let cachedData = queryClient.getQueryData<TrackerPreferences>(
      preferencesKeys.set(setId)
    )
    expect(cachedData?.slotConfig).toBe('SIXTEEN')

    // Wait for error and rollback
    await waitFor(() => expect(result.current.saveError).toBeTruthy())

    // Query cache should roll back
    cachedData = queryClient.getQueryData<TrackerPreferences>(preferencesKeys.set(setId))
    expect(cachedData?.slotConfig).toBe(initialPreferences.slotConfig)

    // Store should also roll back
    const storePreferences = useTrackerStore.getState().preferences
    expect(storePreferences.slotConfig).toBe(initialPreferences.slotConfig)
  })

  it('preserves other preference fields during partial update', async () => {
    const initialPreferences: TrackerPreferences = {
      slotConfig: 'NINE',
      includePromos: true,
      includeReverseHolos: true,
      includePokeball: true,
      includeMasterball: true,
    }
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    vi.mocked(updateTrackerPreferences).mockResolvedValue({
      data: {},
      error: null,
    })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Update only one field
    result.current.updatePreferences({ slotConfig: 'TWELVE' })

    const cachedData = queryClient.getQueryData<TrackerPreferences>(
      preferencesKeys.set(setId)
    )
    expect(cachedData?.slotConfig).toBe('TWELVE')
    expect(cachedData?.includePromos).toBe(true) // Preserved
    expect(cachedData?.includeReverseHolos).toBe(true) // Preserved
    expect(cachedData?.includePokeball).toBe(true) // Preserved

    await waitFor(() => expect(result.current.isUpdating).toBe(false))
  })

  it('handles multiple rapid preference changes', async () => {
    queryClient.setQueryData(preferencesKeys.set(setId), mockTrackerPreferences)

    vi.mocked(updateTrackerPreferences).mockResolvedValue({
      data: {},
      error: null,
    })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toBeTruthy())

    // First update
    result.current.updatePreferences({ includePromos: true })
    expect(useTrackerStore.getState().preferences.includePromos).toBe(true)

    // Second update (before first completes)
    result.current.updatePreferences({ includeReverseHolos: true })
    expect(useTrackerStore.getState().preferences.includeReverseHolos).toBe(true)

    // Both should be true
    await waitFor(() => expect(result.current.isUpdating).toBe(false))
    const storePreferences = useTrackerStore.getState().preferences
    expect(storePreferences.includePromos).toBe(true)
    expect(storePreferences.includeReverseHolos).toBe(true)
  })

  it('resets page to 0 when preferences change', async () => {
    queryClient.setQueryData(preferencesKeys.set(setId), mockTrackerPreferences)

    vi.mocked(updateTrackerPreferences).mockResolvedValue({
      data: {},
      error: null,
    })

    // Set current page to something other than 0
    useTrackerStore.setState({ currentPage: 5 })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toBeTruthy())

    // Update preferences
    result.current.updatePreferences({ slotConfig: 'TWELVE' })

    // Page should reset to 0
    expect(useTrackerStore.getState().currentPage).toBe(0)
  })

  it('does not query when setId is empty', () => {
    const { result } = renderHook(() => useTrackerPreferences(''), {
      wrapper,
    })

    // Should not trigger query
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(vi.mocked(getTrackerPreferences)).not.toHaveBeenCalled()
  })
})
