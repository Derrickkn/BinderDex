/**
 * Shared Filter Constants
 *
 * Centralized filter constants used across Browse, Tracker, Builder, and ChromaDex.
 * Ensures consistency in filtering, sorting, and display across all features.
 */

/**
 * Rarity Order for Sorting
 * Maps rarity names to numeric sort order (most common to rarest)
 * Used for sorting cards by rarity in ascending order
 */
export const RARITY_ORDER: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  "Rare Holo": 4,
  "Rare Ultra": 5,
  "Rare Holo EX": 6,
  "Rare Holo GX": 7,
  "Rare Holo V": 8,
  "Rare Holo VMAX": 9,
  "Rare Holo VSTAR": 10,
  "Rare Secret": 11,
  "Rare Rainbow": 12,
  "Double Rare": 13,
  "Illustration Rare": 14,
  "Special Illustration Rare": 15,
  "Hyper Rare": 16,
  "Ultra Rare": 17,
  "Ace Spec Rare": 18,
  "Shiny Rare": 19,
  "Shiny Ultra Rare": 20,
}

/**
 * Rarity Display Names
 * Maps database rarity values to user-friendly display names
 * Primarily used for pluralization in UI (e.g., "Commons", "Rares")
 */
export const RARITY_DISPLAY: Record<string, string> = {
  common: "Commons",
  uncommon: "Uncommons",
  rare: "Rares",
  "rare holo": "Holos",
  "double rare": "Double Rares",
  "illustration rare": "Illustration Rares",
  "special illustration rare": "Special Illustration Rares",
  "hyper rare": "Hyper Rares",
  "ultra rare": "Ultra Rares",
  "ace spec rare": "Ace Specs",
  "shiny rare": "Shiny Rares",
  "shiny ultra rare": "Shiny Ultra Rares",
}

/**
 * All Pokémon Card Types
 * Used for type-based filtering (e.g., "Show me all Fire-type cards")
 * Ordered alphabetically for consistent display in filter UI
 */
export const CARD_TYPES = [
  "Colorless",
  "Darkness",
  "Dragon",
  "Fairy",
  "Fighting",
  "Fire",
  "Grass",
  "Lightning",
  "Metal",
  "Psychic",
  "Water",
] as const

/**
 * Card Supertypes
 * High-level card categories in Pokémon TCG
 * Used for filtering by card category (e.g., "Pokémon only")
 */
export const CARD_SUPERTYPES = ["Pokémon", "Trainer", "Energy"] as const

/**
 * Pokémon Generations
 * Used for generation-based filtering (e.g., "Gen 1 Pokémon only")
 * Generations 1-9 cover all Pokémon up to Scarlet & Violet era
 */
export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

/**
 * Card Eras
 * Time periods in Pokémon TCG history
 * Used for era-based filtering and set organization
 */
export const CARD_ERAS = [
  "Base",
  "Neo",
  "e-Card",
  "EX",
  "Diamond & Pearl",
  "HeartGold & SoulSilver",
  "Black & White",
  "XY",
  "Sun & Moon",
  "Sword & Shield",
  "Scarlet & Violet",
] as const

/**
 * Type alias for card type values
 */
export type CardType = (typeof CARD_TYPES)[number]

/**
 * Type alias for card supertype values
 */
export type CardSupertype = (typeof CARD_SUPERTYPES)[number]

/**
 * Type alias for generation values
 */
export type Generation = (typeof GENERATIONS)[number]

/**
 * Type alias for era values
 */
export type CardEra = (typeof CARD_ERAS)[number]

/**
 * Helper function to get rarity display name
 * Falls back to original rarity if no display name is defined
 */
export function getRarityDisplay(rarity: string): string {
  return RARITY_DISPLAY[rarity.toLowerCase()] || rarity
}

/**
 * Helper function to get rarity sort order
 * Returns high value (999) for unknown rarities to sort them last
 */
export function getRaritySortOrder(rarity: string): number {
  return RARITY_ORDER[rarity] ?? 999
}
