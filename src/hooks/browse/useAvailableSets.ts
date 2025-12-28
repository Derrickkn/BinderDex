/**
 * Available Sets Hook
 *
 * React Query hook for fetching all available sets with card counts.
 * Used for populating the set filter dropdown in browse and builder features.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { getAvailableSets } from "@/lib/tracker/queries/sets"
import type { SetWithCardCount } from "@/lib/types/tracker"

export const setsKeys = {
  all: ["sets"] as const,
  available: () => [...setsKeys.all, "available"] as const,
}

export function useAvailableSets() {
  return useQuery<SetWithCardCount[], Error>({
    queryKey: setsKeys.available(),
    queryFn: async () => {
      const result = await getAvailableSets()
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (sets don't change frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}
