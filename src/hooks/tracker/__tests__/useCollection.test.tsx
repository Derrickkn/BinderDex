import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, createQueryClientWrapper } from '@/test/utils'
import {
  useToggleOwned,
  useUpdateCollectionEntry,
  useUntrackPromo,
  useRestorePromo,
} from '../useCollection'
import { variantKeys } from '../useSetVariants'
import {
  mockTrackerCard,
  mockTrackerCards,
  mockTrackerPreferences,
  createMockCard,
} from '@/test/mockData/trackerMocks'
import type { TrackerCard } from '@/lib/types/tracker'

// Mock server actions
vi.mock('@/lib/tracker/actions', () => ({
  toggleCardOwned: vi.fn(),
  updateCollectionEntry: vi.fn(),
  untrackPromo: vi.fn(),
  restorePromo: vi.fn(),
  getHiddenPromoCount: vi.fn(),
  getHiddenPromos: vi.fn(),
  resetPromoPreferences: vi.fn(),
}))

// Import mocked functions
import {
  toggleCardOwned,
  updateCollectionEntry,
  untrackPromo,
  restorePromo,
} from '@/lib/tracker/actions'

describe('Collection Hooks - Optimistic Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useToggleOwned', () => {
    const setId = 'me1'
    const preferences = mockTrackerPreferences

    it('applies optimistic update immediately', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      // Setup: Card is not owned
      const card = createMockCard({ variant_id: 'variant-1', owned: false, quantity: 0 })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      // Mock server response (delayed)
      vi.mocked(toggleCardOwned).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { owned: true }, error: null }), 100)
          )
      )

      const { result } = renderHook(() => useToggleOwned(setId, preferences), {
        wrapper,
      })

      // Trigger mutation
      result.current.mutate('variant-1')

      // Optimistic update should apply IMMEDIATELY (before server responds)
      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].owned).toBe(true)
      expect(updatedData?.[0].quantity).toBe(1)

      // Wait for server response
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('toggles owned card to not owned', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      // Setup: Card is owned
      const card = createMockCard({ variant_id: 'variant-1', owned: true, quantity: 1 })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(toggleCardOwned).mockResolvedValue({
        data: { owned: false },
        error: null,
      })

      const { result } = renderHook(() => useToggleOwned(setId, preferences), {
        wrapper,
      })

      result.current.mutate('variant-1')

      // Optimistic update should set owned to false
      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].owned).toBe(false)
      expect(updatedData?.[0].quantity).toBe(0)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('rolls back on server error', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      // Setup: Initial state
      const card = createMockCard({ variant_id: 'variant-1', owned: false, quantity: 0 })
      const initialCards = [card]
      queryClient.setQueryData<TrackerCard[]>(queryKey, initialCards)

      // Mock server error
      vi.mocked(toggleCardOwned).mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const { result } = renderHook(() => useToggleOwned(setId, preferences), {
        wrapper,
      })

      result.current.mutate('variant-1')

      // Optimistic update should apply first
      let updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].owned).toBe(true)

      // Wait for error and rollback
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Should roll back to initial state
      updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].owned).toBe(false)
      expect(updatedData?.[0].quantity).toBe(0)
    })

    it('does not modify other cards in the list', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      // Setup: Multiple cards
      const cards = mockTrackerCards(3)
      queryClient.setQueryData<TrackerCard[]>(queryKey, cards)

      vi.mocked(toggleCardOwned).mockResolvedValue({
        data: { owned: true },
        error: null,
      })

      const { result } = renderHook(() => useToggleOwned(setId, preferences), {
        wrapper,
      })

      // Toggle only the second card
      result.current.mutate('variant-2')

      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData).toHaveLength(3)
      expect(updatedData?.[0].owned).toBe(false) // Not modified
      expect(updatedData?.[1].owned).toBe(true) // Modified
      expect(updatedData?.[2].owned).toBe(false) // Not modified

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('handles multiple rapid toggles correctly', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const card = createMockCard({ variant_id: 'variant-1', owned: false, quantity: 0 })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(toggleCardOwned).mockResolvedValue({
        data: { owned: true },
        error: null,
      })

      const { result } = renderHook(() => useToggleOwned(setId, preferences), {
        wrapper,
      })

      // First toggle
      result.current.mutate('variant-1')
      let data = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(data?.[0].owned).toBe(true)

      // Second toggle (should toggle back)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      result.current.mutate('variant-1')
      data = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(data?.[0].owned).toBe(false)
    })
  })

  describe('useUpdateCollectionEntry', () => {
    const setId = 'me1'
    const preferences = mockTrackerPreferences

    it('optimistically updates quantity and condition', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const card = createMockCard({
        variant_id: 'variant-1',
        owned: true,
        quantity: 1,
        condition: null,
      })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(updateCollectionEntry).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(
        () => useUpdateCollectionEntry(setId, preferences),
        { wrapper }
      )

      result.current.mutate({
        variantId: 'variant-1',
        data: { quantity: 3, condition: 'NM' },
      })

      // Optimistic update should apply immediately
      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].quantity).toBe(3)
      expect(updatedData?.[0].condition).toBe('NM')
      expect(updatedData?.[0].owned).toBe(true) // Quantity > 0

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('sets owned to false when quantity is 0', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const card = createMockCard({
        variant_id: 'variant-1',
        owned: true,
        quantity: 3,
      })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(updateCollectionEntry).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(
        () => useUpdateCollectionEntry(setId, preferences),
        { wrapper }
      )

      result.current.mutate({
        variantId: 'variant-1',
        data: { quantity: 0 },
      })

      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].quantity).toBe(0)
      expect(updatedData?.[0].owned).toBe(false)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('rolls back on server error', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const card = createMockCard({
        variant_id: 'variant-1',
        quantity: 1,
        condition: 'LP',
      })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(updateCollectionEntry).mockResolvedValue({
        data: null,
        error: 'Update failed',
      })

      const { result } = renderHook(
        () => useUpdateCollectionEntry(setId, preferences),
        { wrapper }
      )

      result.current.mutate({
        variantId: 'variant-1',
        data: { quantity: 5, condition: 'NM' },
      })

      // Optimistic update applies
      let data = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(data?.[0].quantity).toBe(5)
      expect(data?.[0].condition).toBe('NM')

      // Wait for error and rollback
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Should rollback to original values
      data = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(data?.[0].quantity).toBe(1)
      expect(data?.[0].condition).toBe('LP')
    })

    it('preserves fields not included in update', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const card = createMockCard({
        variant_id: 'variant-1',
        quantity: 2,
        condition: 'NM',
        notes: 'First edition',
      })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [card])

      vi.mocked(updateCollectionEntry).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(
        () => useUpdateCollectionEntry(setId, preferences),
        { wrapper }
      )

      // Only update quantity
      result.current.mutate({
        variantId: 'variant-1',
        data: { quantity: 3 },
      })

      const updatedData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(updatedData?.[0].quantity).toBe(3)
      expect(updatedData?.[0].condition).toBe('NM') // Preserved
      expect(updatedData?.[0].notes).toBe('First edition') // Preserved

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useUntrackPromo', () => {
    const setId = 'me1'
    const preferences = mockTrackerPreferences
    const hiddenQueryKey = ['hidden-promos-list', setId]

    it('removes promo from main list and adds to hidden list', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      // Setup: Promo card in main list
      const promoCard = createMockCard({
        variant_id: 'variant-promo',
        promo_id: 'promo-1',
        is_promo: true,
      })
      const regularCard = createMockCard({ variant_id: 'variant-1' })
      queryClient.setQueryData<TrackerCard[]>(queryKey, [regularCard, promoCard])
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, [])

      vi.mocked(untrackPromo).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useUntrackPromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-1')

      // Main list should no longer have the promo
      const mainData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(mainData).toHaveLength(1)
      expect(mainData?.[0].variant_id).toBe('variant-1')

      // Hidden list should now have the promo
      const hiddenData = queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)
      expect(hiddenData).toHaveLength(1)
      expect(hiddenData?.[0].promo_id).toBe('promo-1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('rolls back both lists on server error', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const promoCard = createMockCard({ promo_id: 'promo-1', is_promo: true })
      const initialMainCards = [promoCard]
      const initialHiddenCards: TrackerCard[] = []

      queryClient.setQueryData<TrackerCard[]>(queryKey, initialMainCards)
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, initialHiddenCards)

      vi.mocked(untrackPromo).mockResolvedValue({
        data: null,
        error: 'Untrack failed',
      })

      const { result } = renderHook(() => useUntrackPromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-1')

      // Optimistic update applies
      expect(queryClient.getQueryData<TrackerCard[]>(queryKey)).toHaveLength(0)
      expect(queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)).toHaveLength(1)

      // Wait for error and rollback
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Both lists should roll back
      expect(queryClient.getQueryData<TrackerCard[]>(queryKey)).toEqual(initialMainCards)
      expect(queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)).toEqual(
        initialHiddenCards
      )
    })

    it('adds to existing hidden promos list', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const promoCard1 = createMockCard({ promo_id: 'promo-1', is_promo: true })
      const promoCard2 = createMockCard({ promo_id: 'promo-2', is_promo: true })

      queryClient.setQueryData<TrackerCard[]>(queryKey, [promoCard1, promoCard2])
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, [promoCard1])

      vi.mocked(untrackPromo).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useUntrackPromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-2')

      // Hidden list should now have both promos
      const hiddenData = queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)
      expect(hiddenData).toHaveLength(2)
      expect(hiddenData?.map((c) => c.promo_id)).toEqual(['promo-1', 'promo-2'])

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useRestorePromo', () => {
    const setId = 'me1'
    const preferences = mockTrackerPreferences
    const hiddenQueryKey = ['hidden-promos-list', setId]

    it('removes promo from hidden list and adds to main list', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const promoCard = createMockCard({ promo_id: 'promo-1', is_promo: true })
      const regularCard = createMockCard({ variant_id: 'variant-1' })

      queryClient.setQueryData<TrackerCard[]>(queryKey, [regularCard])
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, [promoCard])

      vi.mocked(restorePromo).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useRestorePromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-1')

      // Hidden list should be empty
      const hiddenData = queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)
      expect(hiddenData).toHaveLength(0)

      // Main list should now have the promo
      const mainData = queryClient.getQueryData<TrackerCard[]>(queryKey)
      expect(mainData).toHaveLength(2)
      expect(mainData?.map((c) => c.promo_id || c.variant_id)).toContain('promo-1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('rolls back both lists on server error', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const promoCard = createMockCard({ promo_id: 'promo-1', is_promo: true })
      const initialMainCards: TrackerCard[] = []
      const initialHiddenCards = [promoCard]

      queryClient.setQueryData<TrackerCard[]>(queryKey, initialMainCards)
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, initialHiddenCards)

      vi.mocked(restorePromo).mockResolvedValue({
        data: null,
        error: 'Restore failed',
      })

      const { result } = renderHook(() => useRestorePromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-1')

      // Optimistic update applies
      expect(queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)).toHaveLength(0)
      expect(queryClient.getQueryData<TrackerCard[]>(queryKey)).toHaveLength(1)

      // Wait for error and rollback
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Both lists should roll back
      expect(queryClient.getQueryData<TrackerCard[]>(queryKey)).toEqual(initialMainCards)
      expect(queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)).toEqual(
        initialHiddenCards
      )
    })

    it('preserves other hidden promos', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper()
      const queryKey = variantKeys.withPreferences(setId, preferences)

      const promoCard1 = createMockCard({ promo_id: 'promo-1', is_promo: true })
      const promoCard2 = createMockCard({ promo_id: 'promo-2', is_promo: true })

      queryClient.setQueryData<TrackerCard[]>(queryKey, [])
      queryClient.setQueryData<TrackerCard[]>(hiddenQueryKey, [promoCard1, promoCard2])

      vi.mocked(restorePromo).mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useRestorePromo(setId, preferences), {
        wrapper,
      })

      result.current.mutate('promo-1')

      // Hidden list should still have promo-2
      const hiddenData = queryClient.getQueryData<TrackerCard[]>(hiddenQueryKey)
      expect(hiddenData).toHaveLength(1)
      expect(hiddenData?.[0].promo_id).toBe('promo-2')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
