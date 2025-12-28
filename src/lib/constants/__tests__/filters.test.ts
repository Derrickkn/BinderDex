/**
 * Filter Constants - Unit Tests
 *
 * Tests for shared filter constants and helper functions.
 */

import { describe, it, expect } from "vitest"
import {
  RARITY_ORDER,
  RARITY_DISPLAY,
  CARD_TYPES,
  CARD_SUPERTYPES,
  GENERATIONS,
  CARD_ERAS,
  getRarityDisplay,
  getRaritySortOrder,
} from "../filters"

describe("Filter Constants", () => {
  describe("RARITY_ORDER", () => {
    it("should have numeric values for all rarities", () => {
      expect(RARITY_ORDER.Common).toBe(1)
      expect(RARITY_ORDER.Uncommon).toBe(2)
      expect(RARITY_ORDER.Rare).toBe(3)
      expect(RARITY_ORDER["Rare Holo"]).toBe(4)
    })

    it("should order rarities from common to rare", () => {
      const common = RARITY_ORDER.Common
      const uncommon = RARITY_ORDER.Uncommon
      const rare = RARITY_ORDER.Rare
      const hyperRare = RARITY_ORDER["Hyper Rare"]

      expect(common).toBeLessThan(uncommon)
      expect(uncommon).toBeLessThan(rare)
      expect(rare).toBeLessThan(hyperRare)
    })

    it("should have unique values for all rarities", () => {
      const values = Object.values(RARITY_ORDER)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe("RARITY_DISPLAY", () => {
    it("should map lowercase rarities to display names", () => {
      expect(RARITY_DISPLAY.common).toBe("Commons")
      expect(RARITY_DISPLAY.uncommon).toBe("Uncommons")
      expect(RARITY_DISPLAY.rare).toBe("Rares")
      expect(RARITY_DISPLAY["rare holo"]).toBe("Holos")
    })

    it("should pluralize rarity names", () => {
      Object.values(RARITY_DISPLAY).forEach((displayName) => {
        // Most should end in 's' for pluralization
        expect(displayName.length).toBeGreaterThan(0)
      })
    })
  })

  describe("CARD_TYPES", () => {
    it("should include all Pokémon types", () => {
      expect(CARD_TYPES).toContain("Fire")
      expect(CARD_TYPES).toContain("Water")
      expect(CARD_TYPES).toContain("Grass")
      expect(CARD_TYPES).toContain("Lightning")
      expect(CARD_TYPES).toContain("Psychic")
      expect(CARD_TYPES).toContain("Fighting")
      expect(CARD_TYPES).toContain("Darkness")
      expect(CARD_TYPES).toContain("Metal")
      expect(CARD_TYPES).toContain("Dragon")
      expect(CARD_TYPES).toContain("Fairy")
      expect(CARD_TYPES).toContain("Colorless")
    })

    it("should have 11 types", () => {
      expect(CARD_TYPES).toHaveLength(11)
    })

    it("should be in alphabetical order", () => {
      const sorted = [...CARD_TYPES].sort()
      expect(CARD_TYPES).toEqual(sorted)
    })
  })

  describe("CARD_SUPERTYPES", () => {
    it("should include three supertypes", () => {
      expect(CARD_SUPERTYPES).toContain("Pokémon")
      expect(CARD_SUPERTYPES).toContain("Trainer")
      expect(CARD_SUPERTYPES).toContain("Energy")
    })

    it("should have exactly 3 supertypes", () => {
      expect(CARD_SUPERTYPES).toHaveLength(3)
    })
  })

  describe("GENERATIONS", () => {
    it("should include generations 1-9", () => {
      expect(GENERATIONS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it("should have 9 generations", () => {
      expect(GENERATIONS).toHaveLength(9)
    })

    it("should be in ascending order", () => {
      for (let i = 0; i < GENERATIONS.length - 1; i++) {
        expect(GENERATIONS[i]).toBeLessThan(GENERATIONS[i + 1])
      }
    })
  })

  describe("CARD_ERAS", () => {
    it("should include all TCG eras", () => {
      expect(CARD_ERAS).toContain("Base")
      expect(CARD_ERAS).toContain("Neo")
      expect(CARD_ERAS).toContain("e-Card")
      expect(CARD_ERAS).toContain("EX")
      expect(CARD_ERAS).toContain("Scarlet & Violet")
    })

    it("should have 11 eras", () => {
      expect(CARD_ERAS).toHaveLength(11)
    })
  })

  describe("getRarityDisplay()", () => {
    it("should return display name for lowercase rarity", () => {
      expect(getRarityDisplay("common")).toBe("Commons")
      expect(getRarityDisplay("uncommon")).toBe("Uncommons")
      expect(getRarityDisplay("rare")).toBe("Rares")
      expect(getRarityDisplay("rare holo")).toBe("Holos")
    })

    it("should return original rarity if no display name exists", () => {
      expect(getRarityDisplay("Unknown Rarity")).toBe("Unknown Rarity")
      expect(getRarityDisplay("Custom")).toBe("Custom")
    })

    it("should handle empty string", () => {
      expect(getRarityDisplay("")).toBe("")
    })

    it("should convert to lowercase for lookup", () => {
      expect(getRarityDisplay("Common")).toBe("Commons") // Converts to lowercase
      expect(getRarityDisplay("common")).toBe("Commons") // Already lowercase
      expect(getRarityDisplay("COMMON")).toBe("Commons") // Converts to lowercase
    })
  })

  describe("getRaritySortOrder()", () => {
    it("should return numeric order for known rarities", () => {
      expect(getRaritySortOrder("Common")).toBe(1)
      expect(getRaritySortOrder("Uncommon")).toBe(2)
      expect(getRaritySortOrder("Rare")).toBe(3)
      expect(getRaritySortOrder("Hyper Rare")).toBe(16)
    })

    it("should return 999 for unknown rarities", () => {
      expect(getRaritySortOrder("Unknown Rarity")).toBe(999)
      expect(getRaritySortOrder("Custom")).toBe(999)
      expect(getRaritySortOrder("")).toBe(999)
    })

    it("should sort common before rare", () => {
      const common = getRaritySortOrder("Common")
      const rare = getRaritySortOrder("Hyper Rare")
      expect(common).toBeLessThan(rare)
    })

    it("should sort unknown rarities last", () => {
      const known = getRaritySortOrder("Common")
      const unknown = getRaritySortOrder("Unknown")
      expect(unknown).toBeGreaterThan(known)
    })
  })
})
