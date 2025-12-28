/**
 * Browse Cards - React Query Hook
 *
 * Hook for fetching all unique cards with React Query caching.
 */

import { useQuery } from "@tanstack/react-query"
import { getAllCards } from "@/lib/browse"
import type { BrowseCard } from "@/lib/types/browse"

/**
 * Query key factory for browse cards
 */
export const browseKeys = {
  all: ["browse"] as const,
  cards: () => [...browseKeys.all, "cards"] as const,
}

/**
 * Fetches all unique cards for browsing
 *
 * Uses React Query to cache card data and handle loading/error states.
 * Data is fetched once and cached - filtering happens client-side.
 *
 * @returns React Query result with cards data
 */
export function useBrowseCards() {
  return useQuery<BrowseCard[], Error>({
    queryKey: browseKeys.cards(),
    queryFn: async () => {
      const result = await getAllCards()

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - cards don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  })
}
