/**
 * Card Filters Hook
 *
 * Client-side filtering and sorting for browse cards.
 * Applies all active filters with AND logic and sorts results.
 * Uses useMemo for performance - only recomputes when filters or cards change.
 */

"use client"

import { useMemo } from "react"
import type { BrowseCard } from "@/lib/types/browse"
import { useFilterStore } from "@/stores/filterStore"
import { getRaritySortOrder } from "@/lib/constants/filters"

interface UseCardFiltersResult {
  filteredCards: BrowseCard[]
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
}

/**
 * Filters and sorts cards based on current filter state
 *
 * @param cards - All available cards to filter
 * @returns Filtered and sorted cards with counts
 */
export function useCardFilters(cards: BrowseCard[]): UseCardFiltersResult {
  const {
    searchQuery,
    selectedSets,
    selectedEras,
    selectedTypes,
    selectedRarities,
    selectedGenerations,
    selectedSupertypes,
    premiumOnly,
    legendaryOnly,
    mythicalOnly,
    sortBy,
    sortDirection,
  } = useFilterStore()

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      searchQuery !== "" ||
      selectedSets.length > 0 ||
      selectedEras.length > 0 ||
      selectedTypes.length > 0 ||
      selectedRarities.length > 0 ||
      selectedGenerations.length > 0 ||
      selectedSupertypes.length > 0 ||
      premiumOnly ||
      legendaryOnly ||
      mythicalOnly,
    [
      searchQuery,
      selectedSets,
      selectedEras,
      selectedTypes,
      selectedRarities,
      selectedGenerations,
      selectedSupertypes,
      premiumOnly,
      legendaryOnly,
      mythicalOnly,
    ]
  )

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...cards]

    // 1. Text search (name, number, artist, types)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((card) => {
        const searchableText = [
          card.name,
          card.number,
          card.artist || "",
          ...(card.types || []),
          ...(card.subtypes || []),
          card.sets.name,
        ]
          .join(" ")
          .toLowerCase()

        return searchableText.includes(query)
      })
    }

    // 2. Set filter
    if (selectedSets.length > 0) {
      result = result.filter((card) => selectedSets.includes(card.set_id))
    }

    // 3. Era filter
    if (selectedEras.length > 0) {
      result = result.filter((card) => selectedEras.includes(card.sets.era))
    }

    // 4. Type filter (OR logic - card must have at least one selected type)
    if (selectedTypes.length > 0) {
      result = result.filter((card) => {
        if (!card.types || card.types.length === 0) return false
        return card.types.some((type) => selectedTypes.includes(type))
      })
    }

    // 5. Rarity filter
    if (selectedRarities.length > 0) {
      result = result.filter((card) => selectedRarities.includes(card.rarity))
    }

    // 6. Generation filter
    if (selectedGenerations.length > 0) {
      result = result.filter((card) => {
        if (!card.generation) return false
        return selectedGenerations.includes(card.generation)
      })
    }

    // 7. Supertype filter
    if (selectedSupertypes.length > 0) {
      result = result.filter((card) =>
        selectedSupertypes.includes(card.supertype)
      )
    }

    // 8. Premium toggle
    if (premiumOnly) {
      result = result.filter((card) => card.is_premium)
    }

    // 9. Legendary toggle
    if (legendaryOnly) {
      result = result.filter((card) => card.is_legendary)
    }

    // 10. Mythical toggle
    if (mythicalOnly) {
      result = result.filter((card) => card.is_mythical)
    }

    // Sort results
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break

        case "number": {
          // Try numeric comparison first
          const numA = parseInt(a.number, 10)
          const numB = parseInt(b.number, 10)

          if (!isNaN(numA) && !isNaN(numB)) {
            comparison = numA - numB
          } else {
            // Fallback to alphanumeric comparison
            comparison = a.number.localeCompare(b.number, undefined, {
              numeric: true,
            })
          }
          break
        }

        case "rarity": {
          const rarityA = getRaritySortOrder(a.rarity)
          const rarityB = getRaritySortOrder(b.rarity)

          if (rarityA !== rarityB) {
            comparison = rarityA - rarityB
          } else {
            // Secondary sort by card number
            const numA = parseInt(a.number, 10)
            const numB = parseInt(b.number, 10)
            comparison = isNaN(numA) || isNaN(numB) ? 0 : numA - numB
          }
          break
        }

        case "releaseDate": {
          const dateA = new Date(a.sets.release_date).getTime()
          const dateB = new Date(b.sets.release_date).getTime()
          comparison = dateA - dateB

          // Secondary sort by card number within same release date
          if (comparison === 0) {
            const numA = parseInt(a.number, 10)
            const numB = parseInt(b.number, 10)
            comparison = isNaN(numA) || isNaN(numB) ? 0 : numA - numB
          }
          break
        }
      }

      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [
    cards,
    searchQuery,
    selectedSets,
    selectedEras,
    selectedTypes,
    selectedRarities,
    selectedGenerations,
    selectedSupertypes,
    premiumOnly,
    legendaryOnly,
    mythicalOnly,
    sortBy,
    sortDirection,
  ])

  return {
    filteredCards,
    totalCount: cards.length,
    filteredCount: filteredCards.length,
    hasActiveFilters,
  }
}
