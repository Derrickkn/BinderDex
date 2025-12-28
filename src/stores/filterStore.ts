/**
 * Shared Filter Store
 *
 * Zustand store for managing filter state across Browse, Builder, and ChromaDex.
 * Provides consistent filtering interface and URL parameter sync.
 */

"use client"

import { create } from "zustand"
import type { SortField, SortDirection, ViewMode } from "@/lib/types/browse"

interface FilterState {
  // Search
  searchQuery: string

  // Multi-select filters
  selectedSets: string[]
  selectedEras: string[]
  selectedTypes: string[]
  selectedRarities: string[]
  selectedGenerations: number[]
  selectedSupertypes: string[]

  // Boolean toggles
  premiumOnly: boolean
  legendaryOnly: boolean
  mythicalOnly: boolean

  // Sort & view options
  sortBy: SortField
  sortDirection: SortDirection
  viewMode: ViewMode

  // Actions - Search
  setSearchQuery: (query: string) => void

  // Actions - Multi-select toggles
  toggleSet: (setId: string) => void
  toggleEra: (era: string) => void
  toggleType: (type: string) => void
  toggleRarity: (rarity: string) => void
  toggleGeneration: (generation: number) => void
  toggleSupertype: (supertype: string) => void

  // Actions - Boolean toggles
  togglePremium: () => void
  toggleLegendary: () => void
  toggleMythical: () => void

  // Actions - Sort & View
  setSortBy: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  setViewMode: (mode: ViewMode) => void

  // Actions - Reset
  clearFilters: () => void
  resetAll: () => void

  // URL Parameter Sync
  toURLParams: () => URLSearchParams
  fromURLParams: (params: URLSearchParams) => void
}

const initialState = {
  searchQuery: "",
  selectedSets: [],
  selectedEras: [],
  selectedTypes: [],
  selectedRarities: [],
  selectedGenerations: [],
  selectedSupertypes: [],
  premiumOnly: false,
  legendaryOnly: false,
  mythicalOnly: false,
  sortBy: "number" as SortField,
  sortDirection: "asc" as SortDirection,
  viewMode: "grid" as ViewMode,
}

export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  ...initialState,

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Multi-select toggle actions
  toggleSet: (setId) =>
    set((state) => ({
      selectedSets: state.selectedSets.includes(setId)
        ? state.selectedSets.filter((id) => id !== setId)
        : [...state.selectedSets, setId],
    })),

  toggleEra: (era) =>
    set((state) => ({
      selectedEras: state.selectedEras.includes(era)
        ? state.selectedEras.filter((e) => e !== era)
        : [...state.selectedEras, era],
    })),

  toggleType: (type) =>
    set((state) => ({
      selectedTypes: state.selectedTypes.includes(type)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type],
    })),

  toggleRarity: (rarity) =>
    set((state) => ({
      selectedRarities: state.selectedRarities.includes(rarity)
        ? state.selectedRarities.filter((r) => r !== rarity)
        : [...state.selectedRarities, rarity],
    })),

  toggleGeneration: (generation) =>
    set((state) => ({
      selectedGenerations: state.selectedGenerations.includes(generation)
        ? state.selectedGenerations.filter((g) => g !== generation)
        : [...state.selectedGenerations, generation],
    })),

  toggleSupertype: (supertype) =>
    set((state) => ({
      selectedSupertypes: state.selectedSupertypes.includes(supertype)
        ? state.selectedSupertypes.filter((s) => s !== supertype)
        : [...state.selectedSupertypes, supertype],
    })),

  // Boolean toggle actions
  togglePremium: () => set((state) => ({ premiumOnly: !state.premiumOnly })),
  toggleLegendary: () =>
    set((state) => ({ legendaryOnly: !state.legendaryOnly })),
  toggleMythical: () =>
    set((state) => ({ mythicalOnly: !state.mythicalOnly })),

  // Sort & View actions
  setSortBy: (field) => set({ sortBy: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Clear filters (keep sort/view preferences)
  clearFilters: () =>
    set({
      searchQuery: "",
      selectedSets: [],
      selectedEras: [],
      selectedTypes: [],
      selectedRarities: [],
      selectedGenerations: [],
      selectedSupertypes: [],
      premiumOnly: false,
      legendaryOnly: false,
      mythicalOnly: false,
    }),

  // Reset all state to initial values
  resetAll: () => set(initialState),

  // URL Parameter Serialization
  toURLParams: () => {
    const state = get()
    const params = new URLSearchParams()

    // Search query
    if (state.searchQuery) params.set("q", state.searchQuery)

    // Multi-select filters (comma-separated)
    if (state.selectedSets.length > 0)
      params.set("sets", state.selectedSets.join(","))
    if (state.selectedEras.length > 0)
      params.set("eras", state.selectedEras.join(","))
    if (state.selectedTypes.length > 0)
      params.set("types", state.selectedTypes.join(","))
    if (state.selectedRarities.length > 0)
      params.set("rarities", state.selectedRarities.join(","))
    if (state.selectedGenerations.length > 0)
      params.set("gens", state.selectedGenerations.join(","))
    if (state.selectedSupertypes.length > 0)
      params.set("supertypes", state.selectedSupertypes.join(","))

    // Boolean toggles (only include if true)
    if (state.premiumOnly) params.set("premium", "1")
    if (state.legendaryOnly) params.set("legendary", "1")
    if (state.mythicalOnly) params.set("mythical", "1")

    // Sort & View (only include if not default)
    if (state.sortBy !== "number") params.set("sort", state.sortBy)
    if (state.sortDirection !== "asc") params.set("dir", state.sortDirection)
    if (state.viewMode !== "grid") params.set("view", state.viewMode)

    return params
  },

  // URL Parameter Deserialization
  fromURLParams: (params) => {
    const updates: Partial<typeof initialState> = {}

    // Search query
    const query = params.get("q")
    if (query !== null) updates.searchQuery = query

    // Multi-select filters
    const sets = params.get("sets")
    if (sets) updates.selectedSets = sets.split(",")

    const eras = params.get("eras")
    if (eras) updates.selectedEras = eras.split(",")

    const types = params.get("types")
    if (types) updates.selectedTypes = types.split(",")

    const rarities = params.get("rarities")
    if (rarities) updates.selectedRarities = rarities.split(",")

    const gens = params.get("gens")
    if (gens)
      updates.selectedGenerations = gens.split(",").map((g) => parseInt(g, 10))

    const supertypes = params.get("supertypes")
    if (supertypes) updates.selectedSupertypes = supertypes.split(",")

    // Boolean toggles
    if (params.has("premium")) updates.premiumOnly = true
    if (params.has("legendary")) updates.legendaryOnly = true
    if (params.has("mythical")) updates.mythicalOnly = true

    // Sort & View
    const sort = params.get("sort") as SortField | null
    if (sort) updates.sortBy = sort

    const dir = params.get("dir") as SortDirection | null
    if (dir) updates.sortDirection = dir

    const view = params.get("view") as ViewMode | null
    if (view) updates.viewMode = view

    // Apply all updates at once
    set(updates)
  },
}))
