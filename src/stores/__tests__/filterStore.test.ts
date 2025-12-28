/**
 * Filter Store - Unit Tests
 *
 * Tests for Zustand filter store actions and URL parameter sync.
 */

import { describe, it, expect, beforeEach } from "vitest"
import { useFilterStore } from "../filterStore"

describe("Filter Store", () => {
  // Reset store before each test
  beforeEach(() => {
    useFilterStore.getState().resetAll()
  })

  describe("Initial State", () => {
    it("should have empty filters on initialization", () => {
      const state = useFilterStore.getState()

      expect(state.searchQuery).toBe("")
      expect(state.selectedSets).toEqual([])
      expect(state.selectedEras).toEqual([])
      expect(state.selectedTypes).toEqual([])
      expect(state.selectedRarities).toEqual([])
      expect(state.selectedGenerations).toEqual([])
      expect(state.selectedSupertypes).toEqual([])
      expect(state.premiumOnly).toBe(false)
      expect(state.legendaryOnly).toBe(false)
      expect(state.mythicalOnly).toBe(false)
    })

    it("should have default sort and view settings", () => {
      const state = useFilterStore.getState()

      expect(state.sortBy).toBe("number")
      expect(state.sortDirection).toBe("asc")
      expect(state.viewMode).toBe("grid")
    })
  })

  describe("Search Actions", () => {
    it("should update search query", () => {
      useFilterStore.getState().setSearchQuery("pikachu")
      expect(useFilterStore.getState().searchQuery).toBe("pikachu")
    })

    it("should allow empty search query", () => {
      useFilterStore.getState().setSearchQuery("test")
      useFilterStore.getState().setSearchQuery("")
      expect(useFilterStore.getState().searchQuery).toBe("")
    })
  })

  describe("Multi-Select Toggle Actions", () => {
    it("should toggle set selection", () => {
      const { toggleSet } = useFilterStore.getState()

      toggleSet("set-1")
      expect(useFilterStore.getState().selectedSets).toContain("set-1")

      toggleSet("set-1")
      expect(useFilterStore.getState().selectedSets).not.toContain("set-1")
    })

    it("should toggle era selection", () => {
      const { toggleEra } = useFilterStore.getState()

      toggleEra("Base")
      expect(useFilterStore.getState().selectedEras).toContain("Base")

      toggleEra("Base")
      expect(useFilterStore.getState().selectedEras).not.toContain("Base")
    })

    it("should toggle type selection", () => {
      const { toggleType } = useFilterStore.getState()

      toggleType("Fire")
      expect(useFilterStore.getState().selectedTypes).toContain("Fire")

      toggleType("Fire")
      expect(useFilterStore.getState().selectedTypes).not.toContain("Fire")
    })

    it("should toggle rarity selection", () => {
      const { toggleRarity } = useFilterStore.getState()

      toggleRarity("Rare")
      expect(useFilterStore.getState().selectedRarities).toContain("Rare")

      toggleRarity("Rare")
      expect(useFilterStore.getState().selectedRarities).not.toContain("Rare")
    })

    it("should toggle generation selection", () => {
      const { toggleGeneration } = useFilterStore.getState()

      toggleGeneration(1)
      expect(useFilterStore.getState().selectedGenerations).toContain(1)

      toggleGeneration(1)
      expect(useFilterStore.getState().selectedGenerations).not.toContain(1)
    })

    it("should toggle supertype selection", () => {
      const { toggleSupertype } = useFilterStore.getState()

      toggleSupertype("Pokémon")
      expect(useFilterStore.getState().selectedSupertypes).toContain("Pokémon")

      toggleSupertype("Pokémon")
      expect(useFilterStore.getState().selectedSupertypes).not.toContain(
        "Pokémon"
      )
    })

    it("should allow multiple selections", () => {
      const { toggleType } = useFilterStore.getState()

      toggleType("Fire")
      toggleType("Water")
      toggleType("Grass")

      const types = useFilterStore.getState().selectedTypes
      expect(types).toContain("Fire")
      expect(types).toContain("Water")
      expect(types).toContain("Grass")
      expect(types).toHaveLength(3)
    })
  })

  describe("Boolean Toggle Actions", () => {
    it("should toggle premium filter", () => {
      expect(useFilterStore.getState().premiumOnly).toBe(false)

      useFilterStore.getState().togglePremium()
      expect(useFilterStore.getState().premiumOnly).toBe(true)

      useFilterStore.getState().togglePremium()
      expect(useFilterStore.getState().premiumOnly).toBe(false)
    })

    it("should toggle legendary filter", () => {
      expect(useFilterStore.getState().legendaryOnly).toBe(false)

      useFilterStore.getState().toggleLegendary()
      expect(useFilterStore.getState().legendaryOnly).toBe(true)

      useFilterStore.getState().toggleLegendary()
      expect(useFilterStore.getState().legendaryOnly).toBe(false)
    })

    it("should toggle mythical filter", () => {
      expect(useFilterStore.getState().mythicalOnly).toBe(false)

      useFilterStore.getState().toggleMythical()
      expect(useFilterStore.getState().mythicalOnly).toBe(true)

      useFilterStore.getState().toggleMythical()
      expect(useFilterStore.getState().mythicalOnly).toBe(false)
    })
  })

  describe("Sort & View Actions", () => {
    it("should update sort field", () => {
      useFilterStore.getState().setSortBy("name")
      expect(useFilterStore.getState().sortBy).toBe("name")

      useFilterStore.getState().setSortBy("rarity")
      expect(useFilterStore.getState().sortBy).toBe("rarity")
    })

    it("should update sort direction", () => {
      useFilterStore.getState().setSortDirection("desc")
      expect(useFilterStore.getState().sortDirection).toBe("desc")

      useFilterStore.getState().setSortDirection("asc")
      expect(useFilterStore.getState().sortDirection).toBe("asc")
    })

    it("should update view mode", () => {
      useFilterStore.getState().setViewMode("list")
      expect(useFilterStore.getState().viewMode).toBe("list")

      useFilterStore.getState().setViewMode("grid")
      expect(useFilterStore.getState().viewMode).toBe("grid")
    })
  })

  describe("Clear Filters", () => {
    it("should clear all filters but preserve sort/view", () => {
      const store = useFilterStore.getState()

      // Set various filters
      store.setSearchQuery("pikachu")
      store.toggleType("Fire")
      store.toggleRarity("Rare")
      store.togglePremium()
      store.setSortBy("name")
      store.setViewMode("list")

      // Clear filters
      store.clearFilters()

      // Filters should be reset
      expect(store.searchQuery).toBe("")
      expect(store.selectedTypes).toEqual([])
      expect(store.selectedRarities).toEqual([])
      expect(store.premiumOnly).toBe(false)

      // Sort/view should be preserved
      expect(useFilterStore.getState().sortBy).toBe("name")
      expect(useFilterStore.getState().viewMode).toBe("list")
    })
  })

  describe("Reset All", () => {
    it("should reset all state to initial values", () => {
      const store = useFilterStore.getState()

      // Set various filters
      store.setSearchQuery("pikachu")
      store.toggleType("Fire")
      store.setSortBy("name")
      store.setViewMode("list")

      // Reset all
      store.resetAll()

      const state = useFilterStore.getState()
      expect(state.searchQuery).toBe("")
      expect(state.selectedTypes).toEqual([])
      expect(state.sortBy).toBe("number")
      expect(state.viewMode).toBe("grid")
    })
  })

  describe("URL Parameter Serialization", () => {
    it("should serialize search query to URL params", () => {
      useFilterStore.getState().setSearchQuery("pikachu")
      const params = useFilterStore.getState().toURLParams()

      expect(params.get("q")).toBe("pikachu")
    })

    it("should serialize multi-select filters as comma-separated", () => {
      const { toggleType, toggleRarity } = useFilterStore.getState()

      toggleType("Fire")
      toggleType("Water")
      toggleRarity("Rare")
      toggleRarity("Uncommon")

      const params = useFilterStore.getState().toURLParams()

      expect(params.get("types")).toBe("Fire,Water")
      expect(params.get("rarities")).toBe("Rare,Uncommon")
    })

    it("should serialize boolean toggles as 1", () => {
      const { togglePremium, toggleLegendary } = useFilterStore.getState()

      togglePremium()
      toggleLegendary()

      const params = useFilterStore.getState().toURLParams()

      expect(params.get("premium")).toBe("1")
      expect(params.get("legendary")).toBe("1")
      expect(params.has("mythical")).toBe(false) // Not toggled
    })

    it("should omit default sort and view values", () => {
      const params = useFilterStore.getState().toURLParams()

      expect(params.has("sort")).toBe(false) // Default is 'number'
      expect(params.has("dir")).toBe(false) // Default is 'asc'
      expect(params.has("view")).toBe(false) // Default is 'grid'
    })

    it("should include non-default sort and view values", () => {
      useFilterStore.getState().setSortBy("name")
      useFilterStore.getState().setSortDirection("desc")
      useFilterStore.getState().setViewMode("list")

      const params = useFilterStore.getState().toURLParams()

      expect(params.get("sort")).toBe("name")
      expect(params.get("dir")).toBe("desc")
      expect(params.get("view")).toBe("list")
    })

    it("should omit empty filters", () => {
      const params = useFilterStore.getState().toURLParams()

      expect(params.has("q")).toBe(false)
      expect(params.has("types")).toBe(false)
      expect(params.has("rarities")).toBe(false)
      expect(params.has("premium")).toBe(false)
    })
  })

  describe("URL Parameter Deserialization", () => {
    it("should restore search query from URL params", () => {
      const params = new URLSearchParams("q=pikachu")
      useFilterStore.getState().fromURLParams(params)

      expect(useFilterStore.getState().searchQuery).toBe("pikachu")
    })

    it("should restore multi-select filters from comma-separated values", () => {
      const params = new URLSearchParams("types=Fire,Water&rarities=Rare")
      useFilterStore.getState().fromURLParams(params)

      expect(useFilterStore.getState().selectedTypes).toEqual(["Fire", "Water"])
      expect(useFilterStore.getState().selectedRarities).toEqual(["Rare"])
    })

    it("should restore boolean toggles from presence of param", () => {
      const params = new URLSearchParams("premium=1&legendary=1")
      useFilterStore.getState().fromURLParams(params)

      expect(useFilterStore.getState().premiumOnly).toBe(true)
      expect(useFilterStore.getState().legendaryOnly).toBe(true)
      expect(useFilterStore.getState().mythicalOnly).toBe(false)
    })

    it("should restore sort and view settings", () => {
      const params = new URLSearchParams("sort=name&dir=desc&view=list")
      useFilterStore.getState().fromURLParams(params)

      expect(useFilterStore.getState().sortBy).toBe("name")
      expect(useFilterStore.getState().sortDirection).toBe("desc")
      expect(useFilterStore.getState().viewMode).toBe("list")
    })

    it("should restore generations as numbers", () => {
      const params = new URLSearchParams("gens=1,2,3")
      useFilterStore.getState().fromURLParams(params)

      expect(useFilterStore.getState().selectedGenerations).toEqual([1, 2, 3])
    })

    it("should handle empty URL params", () => {
      // Set some state first
      useFilterStore.getState().setSearchQuery("test")
      useFilterStore.getState().toggleType("Fire")

      // Restore from empty params
      const params = new URLSearchParams("")
      useFilterStore.getState().fromURLParams(params)

      // Previous state should remain (fromURLParams only updates provided params)
      expect(useFilterStore.getState().searchQuery).toBe("test")
      expect(useFilterStore.getState().selectedTypes).toEqual(["Fire"])
    })
  })

  describe("Round-trip Serialization", () => {
    it("should preserve state through serialize -> deserialize", () => {
      const store = useFilterStore.getState()

      // Set complex state
      store.setSearchQuery("charizard")
      store.toggleType("Fire")
      store.toggleType("Dragon")
      store.toggleRarity("Rare")
      store.toggleGeneration(1)
      store.togglePremium()
      store.setSortBy("rarity")
      store.setSortDirection("desc")

      // Serialize to URL
      const params = store.toURLParams()

      // Reset store
      store.resetAll()

      // Deserialize from URL
      store.fromURLParams(params)

      // State should match original
      const state = useFilterStore.getState()
      expect(state.searchQuery).toBe("charizard")
      expect(state.selectedTypes).toEqual(["Fire", "Dragon"])
      expect(state.selectedRarities).toEqual(["Rare"])
      expect(state.selectedGenerations).toEqual([1])
      expect(state.premiumOnly).toBe(true)
      expect(state.sortBy).toBe("rarity")
      expect(state.sortDirection).toBe("desc")
    })
  })
})
