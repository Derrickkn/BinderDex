import type {
  TrackerCard,
  TrackerPreferences,
  TrackerProgress,
  SlotConfig,
  VariantType,
} from '@/lib/types/tracker'

/**
 * Base mock TrackerCard with all required fields populated
 */
export const mockTrackerCard: TrackerCard = {
  // Card base fields
  id: 'me1-1',
  set_id: 'me1',
  name: 'Charizard',
  number: '1',
  rarity: 'Rare Holo',
  supertype: 'Pokémon',
  subtypes: ['Stage 2'],
  types: ['Fire'],
  hp: 150,
  artist: 'Test Artist',
  national_dex_numbers: [6],
  image_small: 'https://images.pokemontcg.io/me1/1.png',
  image_large: 'https://images.pokemontcg.io/me1/1_hires.png',
  is_promo: false,
  is_premium: false,
  is_legendary: false,
  is_mythical: false,
  generation: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',

  // Variant fields
  variant_id: 'variant-1',
  variant_type: 'NORMAL',
  variant_image_url: null,

  // Collection fields
  owned: false,
  quantity: 0,
  condition: null,
  notes: null,
  acquired_date: null,
  collection_id: null,

  // Promo fields
  promo_id: null,
  promo_number: null,
  promo_product_source: null,
  is_promo_untracked: false,
  is_pokemon_center_exclusive: null,
}

/**
 * Create an array of mock TrackerCards with sequential numbering
 * @param count Number of cards to create
 * @param overrides Optional partial overrides to apply to all cards
 * @returns Array of TrackerCard objects
 */
export function mockTrackerCards(
  count: number,
  overrides?: Partial<TrackerCard>
): TrackerCard[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockTrackerCard,
    id: `me1-${i + 1}`,
    name: `Card ${i + 1}`,
    number: String(i + 1),
    variant_id: `variant-${i + 1}`,
    ...overrides,
  }))
}

/**
 * Create a mock TrackerCard with custom overrides
 * @param overrides Partial TrackerCard to override default values
 * @returns TrackerCard object
 */
export function createMockCard(overrides?: Partial<TrackerCard>): TrackerCard {
  return {
    ...mockTrackerCard,
    ...overrides,
  }
}

/**
 * Default tracker preferences for testing
 */
export const mockTrackerPreferences: TrackerPreferences = {
  slotConfig: 'NINE',
  includePromos: true,
  includeReverseHolos: true,
  includePokeball: true,
  includeMasterball: true,
}

/**
 * Create custom tracker preferences
 * @param overrides Partial preferences to override defaults
 * @returns TrackerPreferences object
 */
export function createMockPreferences(
  overrides?: Partial<TrackerPreferences>
): TrackerPreferences {
  return {
    ...mockTrackerPreferences,
    ...overrides,
  }
}

/**
 * Mock progress data
 */
export const mockTrackerProgress: TrackerProgress = {
  totalCards: 10,
  ownedCards: 5,
  percentage: 50,
}

/**
 * Helper to create cards with different variant types
 */
export function createCardsWithVariants(
  count: number,
  variantType: VariantType
): TrackerCard[] {
  return mockTrackerCards(count, { variant_type: variantType })
}

/**
 * Helper to create owned cards
 */
export function createOwnedCards(count: number): TrackerCard[] {
  return mockTrackerCards(count, { owned: true, quantity: 1 })
}

/**
 * Helper to create missing (not owned) cards
 */
export function createMissingCards(count: number): TrackerCard[] {
  return mockTrackerCards(count, { owned: false, quantity: 0 })
}

/**
 * Helper to create promo cards
 */
export function createPromoCards(count: number): TrackerCard[] {
  return mockTrackerCards(count, {
    is_promo: true,
    promo_id: 'promo-1',
    promo_number: 'MEP001',
    promo_product_source: 'Test Product',
  })
}

/**
 * Helper to create cards with mixed ownership (useful for testing progress)
 * @param total Total number of cards
 * @param ownedCount How many should be owned
 * @returns Array of TrackerCard objects
 */
export function createMixedOwnershipCards(
  total: number,
  ownedCount: number
): TrackerCard[] {
  return mockTrackerCards(total).map((card, i) => ({
    ...card,
    owned: i < ownedCount,
    quantity: i < ownedCount ? 1 : 0,
  }))
}

/**
 * Helper to create cards with different numbers for sorting tests
 * @param numbers Array of card numbers (can be numeric or alphanumeric)
 * @returns Array of TrackerCard objects
 */
export function createCardsWithNumbers(numbers: string[]): TrackerCard[] {
  return numbers.map((number, i) => ({
    ...mockTrackerCard,
    id: `me1-${number}`,
    number,
    name: `Card ${number}`,
    variant_id: `variant-${i + 1}`,
  }))
}
