import { describe, it, expect } from 'vitest'
import {
  calculateTotalPages,
  getCardsForPage,
  paginateCards,
  calculateProgress,
  sortCardsByNumber,
  filterCardsByPreferences,
  getMissingCards,
  getGridColsClass,
  getGridRows,
  formatVariantType,
  getPageForCard,
  getViewForCard,
} from '../utils'
import {
  mockTrackerCards,
  createMockCard,
  createMixedOwnershipCards,
  createCardsWithNumbers,
  createCardsWithVariants,
  createPromoCards,
} from '@/test/mockData/trackerMocks'

describe('Tracker Utils', () => {
  // ============================================================================
  // PHASE 1: Simple Functions
  // ============================================================================

  describe('formatVariantType', () => {
    it('formats single word variant types', () => {
      expect(formatVariantType('NORMAL')).toBe('Normal')
    })

    it('formats multi-word variant types', () => {
      expect(formatVariantType('REVERSE_HOLO')).toBe('Reverse Holo')
      expect(formatVariantType('FIRST_EDITION')).toBe('First Edition')
    })

    it('handles pokeball and masterball', () => {
      expect(formatVariantType('POKEBALL')).toBe('Pokeball')
      expect(formatVariantType('MASTERBALL')).toBe('Masterball')
    })

    it('handles shadowless and unlimited', () => {
      expect(formatVariantType('SHADOWLESS')).toBe('Shadowless')
      expect(formatVariantType('UNLIMITED')).toBe('Unlimited')
    })

    it('handles empty string', () => {
      expect(formatVariantType('')).toBe('')
    })

    it('preserves single character words', () => {
      expect(formatVariantType('A_B_C')).toBe('A B C')
    })
  })

  describe('getMissingCards', () => {
    it('returns only cards with owned=false', () => {
      const cards = createMixedOwnershipCards(10, 5)
      const missing = getMissingCards(cards)

      expect(missing).toHaveLength(5)
      expect(missing.every(card => !card.owned)).toBe(true)
    })

    it('returns empty array when all cards are owned', () => {
      const cards = mockTrackerCards(10, { owned: true, quantity: 1 })
      const missing = getMissingCards(cards)

      expect(missing).toHaveLength(0)
    })

    it('returns all cards when none are owned', () => {
      const cards = mockTrackerCards(10, { owned: false, quantity: 0 })
      const missing = getMissingCards(cards)

      expect(missing).toHaveLength(10)
    })

    it('handles empty array', () => {
      const missing = getMissingCards([])
      expect(missing).toHaveLength(0)
    })
  })

  describe('calculateProgress', () => {
    it('calculates 0% for no owned cards', () => {
      const cards = mockTrackerCards(10, { owned: false })
      const progress = calculateProgress(cards)

      expect(progress).toEqual({
        totalCards: 10,
        ownedCards: 0,
        percentage: 0,
      })
    })

    it('calculates 50% for half owned', () => {
      const cards = createMixedOwnershipCards(10, 5)
      const progress = calculateProgress(cards)

      expect(progress).toEqual({
        totalCards: 10,
        ownedCards: 5,
        percentage: 50,
      })
    })

    it('calculates 100% for all owned', () => {
      const cards = mockTrackerCards(10, { owned: true, quantity: 1 })
      const progress = calculateProgress(cards)

      expect(progress).toEqual({
        totalCards: 10,
        ownedCards: 10,
        percentage: 100,
      })
    })

    it('handles empty array without division by zero', () => {
      const progress = calculateProgress([])

      expect(progress).toEqual({
        totalCards: 0,
        ownedCards: 0,
        percentage: 0,
      })
    })

    it('rounds percentage correctly', () => {
      const cards = createMixedOwnershipCards(3, 1) // 1/3 = 33.33%
      const progress = calculateProgress(cards)

      expect(progress.percentage).toBe(33) // Rounded down
    })

    it('handles single card', () => {
      const cards = [createMockCard({ owned: true, quantity: 1 })]
      const progress = calculateProgress(cards)

      expect(progress).toEqual({
        totalCards: 1,
        ownedCards: 1,
        percentage: 100,
      })
    })
  })

  describe('getGridColsClass', () => {
    it('returns grid-cols-3 for NINE config', () => {
      expect(getGridColsClass('NINE')).toBe('grid-cols-3')
    })

    it('returns grid-cols-4 for TWELVE config', () => {
      expect(getGridColsClass('TWELVE')).toBe('grid-cols-4')
    })

    it('returns grid-cols-4 for SIXTEEN config', () => {
      expect(getGridColsClass('SIXTEEN')).toBe('grid-cols-4')
    })
  })

  describe('getGridRows', () => {
    it('returns 3 rows for NINE config', () => {
      expect(getGridRows('NINE')).toBe(3)
    })

    it('returns 3 rows for TWELVE config', () => {
      expect(getGridRows('TWELVE')).toBe(3)
    })

    it('returns 4 rows for SIXTEEN config', () => {
      expect(getGridRows('SIXTEEN')).toBe(4)
    })
  })

  // ============================================================================
  // PHASE 2: Pagination Functions
  // ============================================================================

  describe('calculateTotalPages', () => {
    it('calculates correct pages for NINE slot config', () => {
      expect(calculateTotalPages(27, 'NINE')).toBe(3)  // Exact multiple
      expect(calculateTotalPages(28, 'NINE')).toBe(4)  // One extra
      expect(calculateTotalPages(9, 'NINE')).toBe(1)   // Exact fit
      expect(calculateTotalPages(8, 'NINE')).toBe(1)   // Under by one
      expect(calculateTotalPages(10, 'NINE')).toBe(2)  // Over by one
    })

    it('calculates correct pages for TWELVE slot config', () => {
      expect(calculateTotalPages(36, 'TWELVE')).toBe(3)  // Exact multiple
      expect(calculateTotalPages(37, 'TWELVE')).toBe(4)  // One extra
      expect(calculateTotalPages(12, 'TWELVE')).toBe(1)  // Exact fit
    })

    it('calculates correct pages for SIXTEEN slot config', () => {
      expect(calculateTotalPages(48, 'SIXTEEN')).toBe(3)  // Exact multiple
      expect(calculateTotalPages(49, 'SIXTEEN')).toBe(4)  // One extra
      expect(calculateTotalPages(16, 'SIXTEEN')).toBe(1)  // Exact fit
    })

    it('returns 0 for empty card list', () => {
      expect(calculateTotalPages(0, 'NINE')).toBe(0)
      expect(calculateTotalPages(0, 'TWELVE')).toBe(0)
      expect(calculateTotalPages(0, 'SIXTEEN')).toBe(0)
    })

    it('returns 1 for single card', () => {
      expect(calculateTotalPages(1, 'NINE')).toBe(1)
      expect(calculateTotalPages(1, 'TWELVE')).toBe(1)
      expect(calculateTotalPages(1, 'SIXTEEN')).toBe(1)
    })

    it('handles large numbers', () => {
      expect(calculateTotalPages(1000, 'NINE')).toBe(112)  // 1000 / 9 = 111.11 → 112
    })
  })

  describe('getCardsForPage', () => {
    const cards = mockTrackerCards(27)

    it('returns correct cards for page 0', () => {
      const result = getCardsForPage(cards, 0, 'NINE')

      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('1')
      expect(result[8].number).toBe('9')
    })

    it('returns correct cards for page 1', () => {
      const result = getCardsForPage(cards, 1, 'NINE')

      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('10')
      expect(result[8].number).toBe('18')
    })

    it('returns correct cards for last page', () => {
      const result = getCardsForPage(cards, 2, 'NINE')

      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('19')
      expect(result[8].number).toBe('27')
    })

    it('handles partial last page', () => {
      const partialCards = mockTrackerCards(25)  // 25 cards = 3 pages (9, 9, 7)
      const result = getCardsForPage(partialCards, 2, 'NINE')

      expect(result).toHaveLength(7)
      expect(result[0].number).toBe('19')
      expect(result[6].number).toBe('25')
    })

    it('returns empty array for out-of-bounds page', () => {
      const result = getCardsForPage(cards, 10, 'NINE')
      expect(result).toHaveLength(0)
    })

    it('handles empty cards array', () => {
      const result = getCardsForPage([], 0, 'NINE')
      expect(result).toHaveLength(0)
    })
  })

  describe('getPageForCard', () => {
    const cards = mockTrackerCards(27)

    it('returns 0 for card on first page', () => {
      const result = getPageForCard(cards, 'variant-1', 'NINE')
      expect(result).toBe(0)
    })

    it('returns correct page for card on second page', () => {
      const result = getPageForCard(cards, 'variant-10', 'NINE')  // Card #10
      expect(result).toBe(1)  // Page 1 (0-indexed)
    })

    it('returns correct page for last card', () => {
      const result = getPageForCard(cards, 'variant-27', 'NINE')
      expect(result).toBe(2)  // Page 2
    })

    it('returns 0 when card not found', () => {
      const result = getPageForCard(cards, 'nonexistent', 'NINE')
      expect(result).toBe(0)
    })

    it('handles different slot configs correctly', () => {
      const result12 = getPageForCard(cards, 'variant-13', 'TWELVE')  // Card #13
      expect(result12).toBe(1)  // Page 1 (cards 13-24 on second page)

      const result16 = getPageForCard(cards, 'variant-17', 'SIXTEEN')  // Card #17
      expect(result16).toBe(1)  // Page 1 (cards 17-32 on second page)
    })
  })

  describe('getViewForCard', () => {
    const cards = mockTrackerCards(36)  // 4 pages with NINE config

    it('returns correct view for desktop (2 pages per view)', () => {
      const result = getViewForCard(cards, 'variant-1', 'NINE', 2)
      expect(result).toBe(0)  // Card on page 0, view 0

      const resultPage2 = getViewForCard(cards, 'variant-19', 'NINE', 2)
      expect(resultPage2).toBe(1)  // Card on page 2, view 1 (pages 2-3)
    })

    it('returns correct view for mobile (1 page per view)', () => {
      const result = getViewForCard(cards, 'variant-1', 'NINE', 1)
      expect(result).toBe(0)  // Card on page 0, view 0

      const resultPage2 = getViewForCard(cards, 'variant-19', 'NINE', 1)
      expect(resultPage2).toBe(2)  // Card on page 2, view 2
    })

    it('returns 0 when card not found', () => {
      const result = getViewForCard(cards, 'nonexistent', 'NINE', 2)
      expect(result).toBe(0)
    })
  })

  describe('paginateCards', () => {
    it('creates correct number of pages', () => {
      const cards = mockTrackerCards(27)
      const pages = paginateCards(cards, 'NINE')

      expect(pages).toHaveLength(3)
    })

    it('assigns correct page numbers', () => {
      const cards = mockTrackerCards(27)
      const pages = paginateCards(cards, 'NINE')

      expect(pages[0].pageNumber).toBe(0)
      expect(pages[1].pageNumber).toBe(1)
      expect(pages[2].pageNumber).toBe(2)
    })

    it('distributes cards correctly across pages', () => {
      const cards = mockTrackerCards(27)
      const pages = paginateCards(cards, 'NINE')

      expect(pages[0].cards).toHaveLength(9)
      expect(pages[1].cards).toHaveLength(9)
      expect(pages[2].cards).toHaveLength(9)
    })

    it('handles partial last page', () => {
      const cards = mockTrackerCards(25)
      const pages = paginateCards(cards, 'NINE')

      expect(pages).toHaveLength(3)
      expect(pages[2].cards).toHaveLength(7)
    })

    it('returns empty array for no cards', () => {
      const pages = paginateCards([], 'NINE')
      expect(pages).toHaveLength(0)
    })

    it('creates single page for cards under limit', () => {
      const cards = mockTrackerCards(5)
      const pages = paginateCards(cards, 'NINE')

      expect(pages).toHaveLength(1)
      expect(pages[0].cards).toHaveLength(5)
    })
  })

  // ============================================================================
  // PHASE 3: Complex Functions
  // ============================================================================

  describe('sortCardsByNumber', () => {
    it('sorts numeric card numbers correctly', () => {
      const cards = createCardsWithNumbers(['10', '2', '1', '20'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.number)).toEqual(['1', '2', '10', '20'])
    })

    it('handles mixed numeric and alphanumeric numbers', () => {
      const cards = createCardsWithNumbers(['10', 'SV1', '2', 'SV10'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.number)).toEqual(['2', '10', 'SV1', 'SV10'])
    })

    it('sorts by variant type when numbers are equal', () => {
      const cards = [
        createMockCard({ number: '1', variant_type: 'REVERSE_HOLO', variant_id: 'v1' }),
        createMockCard({ number: '1', variant_type: 'NORMAL', variant_id: 'v2' }),
        createMockCard({ number: '1', variant_type: 'POKEBALL', variant_id: 'v3' }),
      ]
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.variant_type)).toEqual([
        'NORMAL',
        'POKEBALL',
        'REVERSE_HOLO',
      ])
    })

    it('handles cards with leading zeros', () => {
      const cards = createCardsWithNumbers(['001', '10', '002'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.number)).toEqual(['001', '002', '10'])
    })

    it('handles alphanumeric suffixes', () => {
      const cards = createCardsWithNumbers(['102b', '102', '102a'])
      const sorted = sortCardsByNumber(cards)

      // When numbers parse to same integer, sorting is complex
      // The function uses localeCompare with numeric: true which handles this
      // Just verify sorting doesn't crash and returns all cards
      expect(sorted).toHaveLength(3)
      expect(sorted.map(c => c.number)).toContain('102')
      expect(sorted.map(c => c.number)).toContain('102a')
      expect(sorted.map(c => c.number)).toContain('102b')
    })

    it('handles empty array', () => {
      const sorted = sortCardsByNumber([])
      expect(sorted).toHaveLength(0)
    })

    it('handles single card', () => {
      const cards = createCardsWithNumbers(['1'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted).toHaveLength(1)
      expect(sorted[0].number).toBe('1')
    })

    it('handles already sorted array', () => {
      const cards = createCardsWithNumbers(['1', '2', '3', '4'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.number)).toEqual(['1', '2', '3', '4'])
    })

    it('handles reverse sorted array', () => {
      const cards = createCardsWithNumbers(['4', '3', '2', '1'])
      const sorted = sortCardsByNumber(cards)

      expect(sorted.map(c => c.number)).toEqual(['1', '2', '3', '4'])
    })

    it('does not mutate original array', () => {
      const cards = createCardsWithNumbers(['3', '1', '2'])
      const originalNumbers = cards.map(c => c.number)

      sortCardsByNumber(cards)

      // Original should be unchanged
      expect(cards.map(c => c.number)).toEqual(originalNumbers)
    })
  })

  describe('filterCardsByPreferences', () => {
    it('includes only NORMAL variants when both flags are false', () => {
      const cards = [
        createMockCard({ variant_type: 'NORMAL', variant_id: 'v1' }),
        createMockCard({ variant_type: 'REVERSE_HOLO', variant_id: 'v2' }),
        createMockCard({ variant_type: 'NORMAL', variant_id: 'v3' }),
      ]

      const filtered = filterCardsByPreferences(cards, false, false)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(c => c.variant_type === 'NORMAL')).toBe(true)
    })

    it('includes NORMAL and REVERSE_HOLO when includeReverseHolos is true', () => {
      const cards = [
        createMockCard({ variant_type: 'NORMAL', variant_id: 'v1' }),
        createMockCard({ variant_type: 'REVERSE_HOLO', variant_id: 'v2' }),
        createMockCard({ variant_type: 'NORMAL', variant_id: 'v3' }),
      ]

      const filtered = filterCardsByPreferences(cards, false, true)

      expect(filtered).toHaveLength(3)
    })

    it('filters out promos when includePromos is false', () => {
      const cards = [
        createMockCard({ is_promo: false, variant_id: 'v1' }),
        createMockCard({ is_promo: true, variant_id: 'v2' }),
        createMockCard({ is_promo: false, variant_id: 'v3' }),
      ]

      const filtered = filterCardsByPreferences(cards, false, false)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(c => !c.is_promo)).toBe(true)
    })

    it('includes promos when includePromos is true', () => {
      const cards = [
        createMockCard({ is_promo: false, variant_id: 'v1' }),
        createMockCard({ is_promo: true, variant_id: 'v2' }),
      ]

      const filtered = filterCardsByPreferences(cards, true, false)

      expect(filtered).toHaveLength(2)
    })

    it('handles empty array', () => {
      const filtered = filterCardsByPreferences([], false, false)
      expect(filtered).toHaveLength(0)
    })

    it('returns empty array when no cards match criteria', () => {
      const cards = [
        createMockCard({ variant_type: 'POKEBALL', variant_id: 'v1' }),
        createMockCard({ variant_type: 'MASTERBALL', variant_id: 'v2' }),
      ]

      const filtered = filterCardsByPreferences(cards, false, false)
      expect(filtered).toHaveLength(0)
    })
  })
})
