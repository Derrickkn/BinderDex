/**
 * useCardFilters Hook - Unit Tests
 *
 * Tests for client-side card filtering and sorting logic.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useCardFilters } from "../useCardFilters"
import { useFilterStore } from "@/stores/filterStore"
import type { BrowseCard } from "@/lib/types/browse"

// Mock filter store
vi.mock("@/stores/filterStore")

// Mock card data
const mockCards: BrowseCard[] = [
  {
    id: "1",
    set_id: "set-1",
    name: "Pikachu",
    number: "25",
    rarity: "Common",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Lightning"],
    hp: 60,
    artist: "Artist 1",
    national_dex_numbers: [25],
    image_small: "/image1.jpg",
    image_large: "/image1-large.jpg",
    is_promo: false,
    is_premium: false,
    is_legendary: false,
    is_mythical: false,
    generation: 1,
    sets: {
      id: "set-1",
      name: "Base Set",
      era: "Base",
      series: "Original Series",
      release_date: "1999-01-09",
      logo_url: "/logo1.png",
    },
  },
  {
    id: "2",
    set_id: "set-1",
    name: "Charizard",
    number: "4",
    rarity: "Rare Holo",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    types: ["Fire"],
    hp: 120,
    artist: "Artist 2",
    national_dex_numbers: [6],
    image_small: "/image2.jpg",
    image_large: "/image2-large.jpg",
    is_promo: false,
    is_premium: true,
    is_legendary: false,
    is_mythical: false,
    generation: 1,
    sets: {
      id: "set-1",
      name: "Base Set",
      era: "Base",
      series: "Original Series",
      release_date: "1999-01-09",
      logo_url: "/logo1.png",
    },
  },
  {
    id: "3",
    set_id: "set-2",
    name: "Mewtwo",
    number: "10",
    rarity: "Rare",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Psychic"],
    hp: 80,
    artist: "Artist 3",
    national_dex_numbers: [150],
    image_small: "/image3.jpg",
    image_large: "/image3-large.jpg",
    is_promo: false,
    is_premium: false,
    is_legendary: true,
    is_mythical: false,
    generation: 1,
    sets: {
      id: "set-2",
      name: "Fossil",
      era: "Base",
      series: "Original Series",
      release_date: "1999-10-10",
      logo_url: "/logo2.png",
    },
  },
  {
    id: "4",
    set_id: "set-2",
    name: "Mew",
    number: "8",
    rarity: "Rare Holo",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Psychic"],
    hp: 50,
    artist: "Artist 4",
    national_dex_numbers: [151],
    image_small: "/image4.jpg",
    image_large: "/image4-large.jpg",
    is_promo: true,
    is_premium: false,
    is_legendary: false,
    is_mythical: true,
    generation: 1,
    sets: {
      id: "set-2",
      name: "Fossil",
      era: "Base",
      series: "Original Series",
      release_date: "1999-10-10",
      logo_url: "/logo2.png",
    },
  },
]

describe("useCardFilters", () => {
  beforeEach(() => {
    // Reset mock to default state (no filters)
    vi.mocked(useFilterStore).mockReturnValue({
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
      sortBy: "number",
      sortDirection: "asc",
      viewMode: "grid",
      setSearchQuery: vi.fn(),
      toggleSet: vi.fn(),
      toggleEra: vi.fn(),
      toggleType: vi.fn(),
      toggleRarity: vi.fn(),
      toggleGeneration: vi.fn(),
      toggleSupertype: vi.fn(),
      togglePremium: vi.fn(),
      toggleLegendary: vi.fn(),
      toggleMythical: vi.fn(),
      setSortBy: vi.fn(),
      setSortDirection: vi.fn(),
      setViewMode: vi.fn(),
      clearFilters: vi.fn(),
      resetAll: vi.fn(),
      toURLParams: vi.fn(),
      fromURLParams: vi.fn(),
    })
  })

  describe("No Filters", () => {
    it("should return all cards when no filters are active", () => {
      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(4)
      expect(result.current.totalCount).toBe(4)
      expect(result.current.filteredCount).toBe(4)
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it("should return empty array for empty input", () => {
      const { result } = renderHook(() => useCardFilters([]))

      expect(result.current.filteredCards).toHaveLength(0)
      expect(result.current.totalCount).toBe(0)
      expect(result.current.filteredCount).toBe(0)
    })
  })

  describe("Text Search", () => {
    it("should filter by card name", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "pikachu",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Pikachu")
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it("should filter by card number", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "25",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].number).toBe("25")
    })

    it("should filter by artist", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "artist 2",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].artist).toBe("Artist 2")
    })

    it("should filter by type", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "fire",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].types).toContain("Fire")
    })

    it("should be case-insensitive", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "CHARIZARD",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Charizard")
    })
  })

  describe("Set Filter", () => {
    it("should filter by selected set", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedSets: ["set-1"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(2)
      expect(result.current.filteredCards.every((c) => c.set_id === "set-1")).toBe(true)
    })

    it("should filter by multiple sets (OR logic)", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedSets: ["set-1", "set-2"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(4)
    })
  })

  describe("Era Filter", () => {
    it("should filter by era", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedEras: ["Base"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(4)
      expect(result.current.filteredCards.every((c) => c.sets.era === "Base")).toBe(true)
    })
  })

  describe("Type Filter", () => {
    it("should filter by single type", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedTypes: ["Fire"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Charizard")
    })

    it("should filter by multiple types (OR logic)", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedTypes: ["Fire", "Psychic"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(3) // Charizard, Mewtwo, Mew
    })
  })

  describe("Rarity Filter", () => {
    it("should filter by rarity", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedRarities: ["Rare Holo"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(2) // Charizard, Mew
    })
  })

  describe("Generation Filter", () => {
    it("should filter by generation", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedGenerations: [1],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(4) // All are Gen 1
    })
  })

  describe("Supertype Filter", () => {
    it("should filter by supertype", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedSupertypes: ["Pokémon"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(4) // All are Pokémon
    })
  })

  describe("Boolean Toggles", () => {
    it("should filter premium cards only", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        premiumOnly: true,
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Charizard")
    })

    it("should filter legendary cards only", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        legendaryOnly: true,
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Mewtwo")
    })

    it("should filter mythical cards only", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        mythicalOnly: true,
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Mew")
    })
  })

  describe("Sorting", () => {
    it("should sort by card number ascending", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        sortBy: "number",
        sortDirection: "asc",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards[0].number).toBe("4")
      expect(result.current.filteredCards[3].number).toBe("25")
    })

    it("should sort by card number descending", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        sortBy: "number",
        sortDirection: "desc",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards[0].number).toBe("25")
      expect(result.current.filteredCards[3].number).toBe("4")
    })

    it("should sort by name ascending", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        sortBy: "name",
        sortDirection: "asc",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards[0].name).toBe("Charizard")
      expect(result.current.filteredCards[3].name).toBe("Pikachu")
    })

    it("should sort by rarity ascending", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        sortBy: "rarity",
        sortDirection: "asc",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards[0].rarity).toBe("Common")
      expect(result.current.filteredCards[3].rarity).toBe("Rare Holo")
    })

    it("should sort by release date ascending", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        sortBy: "releaseDate",
        sortDirection: "asc",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards[0].sets.release_date).toBe("1999-01-09")
      expect(result.current.filteredCards[2].sets.release_date).toBe("1999-10-10")
    })
  })

  describe("Combined Filters", () => {
    it("should apply multiple filters with AND logic", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        selectedTypes: ["Psychic"],
        legendaryOnly: true,
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(1)
      expect(result.current.filteredCards[0].name).toBe("Mewtwo")
    })

    it("should apply search with other filters", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "mew",
        selectedTypes: ["Psychic"],
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.filteredCards).toHaveLength(2) // Mewtwo, Mew
    })
  })

  describe("Active Filters Detection", () => {
    it("should detect active filters correctly", () => {
      vi.mocked(useFilterStore).mockReturnValue({
        ...vi.mocked(useFilterStore)(),
        searchQuery: "pikachu",
      })

      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it("should detect no active filters", () => {
      const { result } = renderHook(() => useCardFilters(mockCards))

      expect(result.current.hasActiveFilters).toBe(false)
    })
  })
})
