/**
 * Browse Cards - Type Definitions
 *
 * Types for the card browser feature that displays unique cards (NO variants)
 * with filtering, sorting, and search capabilities.
 */

/**
 * Card type for browse view (unique cards only, enriched with set data)
 */
export interface BrowseCard {
  // Card fields
  id: string
  set_id: string
  name: string
  number: string
  rarity: string
  supertype: string
  subtypes: string[]
  types: string[]
  hp: number | null
  artist: string | null
  national_dex_numbers: number[] | null
  image_small: string
  image_large: string
  is_promo: boolean
  is_premium: boolean
  is_legendary: boolean
  is_mythical: boolean
  generation: number | null

  // Enriched set data (joined from sets table)
  sets: {
    id: string
    name: string
    era: string
    series: string
    release_date: string
    logo_url: string | null
    total: number
  }
}

/**
 * Sort field options
 */
export type SortField = "name" | "number" | "rarity" | "releaseDate"

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc"

/**
 * View mode options
 */
export type ViewMode = "grid" | "list"

/**
 * Filter state shape (matches filterStore)
 */
export interface BrowseFilters {
  searchQuery: string
  selectedSets: string[]
  selectedEras: string[]
  selectedTypes: string[]
  selectedRarities: string[]
  selectedGenerations: number[]
  selectedSupertypes: string[]
  premiumOnly: boolean
  legendaryOnly: boolean
  mythicalOnly: boolean
  sortBy: SortField
  sortDirection: SortDirection
  viewMode: ViewMode
}
