import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act, createQueryClientWrapper } from '@/test/utils'
import { useTrackerPreferences, preferencesKeys } from '../useTrackerPreferences'
import { useTrackerStore } from '@/hooks/useTrackerStore'
import { mockTrackerPreferences } from '@/test/mockData/trackerMocks'
import type { TrackerPreferences } from '@/lib/types/tracker'

// Mock server actions
vi.mock('@/lib/tracker/queries/preferences', () => ({
  getTrackerPreferences: vi.fn(),
}))

vi.mock('@/lib/tracker/mutations/preferences', () => ({
  updateTrackerPreferences: vi.fn(),
}))

// Import mocked functions
import { getTrackerPreferences } from '@/lib/tracker/queries/preferences'
import { updateTrackerPreferences } from '@/lib/tracker/mutations/preferences'

describe('useTrackerPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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

  const setId = 'me1'

  it('loads preferences from server and syncs to store', async () => {
    const { queryClient, wrapper } = createQueryClientWrapper()
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
    const { queryClient, wrapper } = createQueryClientWrapper()
    const initialPreferences = mockTrackerPreferences
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    // Mock server response (delayed to capture optimistic state)
    vi.mocked(updateTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 50)
        )
    )

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    // Wait for initial data to sync to store
    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Update preferences
    const newPreferences = { includePromos: false, includeReverseHolos: false }
    await act(async () => {
      result.current.updatePreferences(newPreferences)
      await Promise.resolve()
    })

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
    const { queryClient, wrapper } = createQueryClientWrapper()
    const initialPreferences = mockTrackerPreferences
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    // Mock getTrackerPreferences to return initial state (for refetch after onSettled)
    vi.mocked(getTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: initialPreferences, error: null }), 50)
        )
    )

    // Mock server error (delayed to capture optimistic state)
    vi.mocked(updateTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: null, error: 'Update failed' }), 50)
        )
    )

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Attempt to update
    await act(async () => {
      result.current.updatePreferences({ slotConfig: 'SIXTEEN' })
      await Promise.resolve()
    })

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
    const { queryClient, wrapper } = createQueryClientWrapper()
    const initialPreferences: TrackerPreferences = {
      slotConfig: 'NINE',
      includePromos: true,
      includeReverseHolos: true,
      includePokeball: true,
      includeMasterball: true,
    }
    queryClient.setQueryData(preferencesKeys.set(setId), initialPreferences)

    // Expected state after update
    const expectedAfterUpdate: TrackerPreferences = {
      ...initialPreferences,
      slotConfig: 'TWELVE',
    }

    // Mock getTrackerPreferences to return updated state (for refetch after onSettled)
    vi.mocked(getTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: expectedAfterUpdate, error: null }), 50)
        )
    )

    // Mock server response (delayed to capture optimistic state)
    vi.mocked(updateTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 50)
        )
    )

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual(initialPreferences))

    // Update only one field
    await act(async () => {
      result.current.updatePreferences({ slotConfig: 'TWELVE' })
      await Promise.resolve()
    })

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
    const { queryClient, wrapper } = createQueryClientWrapper()
    queryClient.setQueryData(preferencesKeys.set(setId), mockTrackerPreferences)

    // Mock server response (delayed to capture optimistic state)
    vi.mocked(updateTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 50)
        )
    )

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toBeTruthy())

    // First update
    await act(async () => {
      result.current.updatePreferences({ includePromos: true })
      await Promise.resolve()
    })
    expect(useTrackerStore.getState().preferences.includePromos).toBe(true)

    // Second update (before first completes)
    await act(async () => {
      result.current.updatePreferences({ includeReverseHolos: true })
      await Promise.resolve()
    })
    expect(useTrackerStore.getState().preferences.includeReverseHolos).toBe(true)

    // Both should be true
    await waitFor(() => expect(result.current.isUpdating).toBe(false))
    const storePreferences = useTrackerStore.getState().preferences
    expect(storePreferences.includePromos).toBe(true)
    expect(storePreferences.includeReverseHolos).toBe(true)
  })

  it('resets page to 0 when preferences change', async () => {
    const { queryClient, wrapper } = createQueryClientWrapper()
    queryClient.setQueryData(preferencesKeys.set(setId), mockTrackerPreferences)

    // Mock server response (delayed to capture optimistic state)
    vi.mocked(updateTrackerPreferences).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 50)
        )
    )

    // Set current page to something other than 0
    useTrackerStore.setState({ currentPage: 5 })

    const { result } = renderHook(() => useTrackerPreferences(setId), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toBeTruthy())

    // Update preferences
    await act(async () => {
      result.current.updatePreferences({ slotConfig: 'TWELVE' })
      await Promise.resolve()
    })

    // Page should reset to 0
    expect(useTrackerStore.getState().currentPage).toBe(0)
  })

  it('does not query when setId is empty', () => {
    const { wrapper } = createQueryClientWrapper()
    const { result } = renderHook(() => useTrackerPreferences(''), {
      wrapper,
    })

    // Should not trigger query
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(vi.mocked(getTrackerPreferences)).not.toHaveBeenCalled()
  })
})
