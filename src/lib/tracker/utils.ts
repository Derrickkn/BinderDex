import {
  TrackerCard,
  TrackerPage,
  TrackerProgress,
  SlotConfig,
  SLOT_CONFIGS,
} from "@/lib/types/tracker";

/**
 * Calculate total pages needed for a set of cards with the given slot configuration
 */
export function calculateTotalPages(
  totalCards: number,
  slotConfig: SlotConfig
): number {
  const slotsPerPage = SLOT_CONFIGS[slotConfig].total;
  return Math.ceil(totalCards / slotsPerPage);
}

/**
 * Get cards for a specific page number
 */
export function getCardsForPage(
  cards: TrackerCard[],
  pageNumber: number,
  slotConfig: SlotConfig
): TrackerCard[] {
  const slotsPerPage = SLOT_CONFIGS[slotConfig].total;
  const startIndex = pageNumber * slotsPerPage;
  return cards.slice(startIndex, startIndex + slotsPerPage);
}

/**
 * Paginate cards into pages based on slot configuration
 */
export function paginateCards(
  cards: TrackerCard[],
  slotConfig: SlotConfig
): TrackerPage[] {
  const totalPages = calculateTotalPages(cards.length, slotConfig);
  const pages: TrackerPage[] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push({
      pageNumber: i,
      cards: getCardsForPage(cards, i, slotConfig),
    });
  }

  return pages;
}

/**
 * Calculate progress for a set of tracker cards
 */
export function calculateProgress(cards: TrackerCard[]): TrackerProgress {
  const totalCards = cards.length;
  const ownedCards = cards.filter((card) => card.owned).length;
  const percentage =
    totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;

  return {
    totalCards,
    ownedCards,
    percentage,
  };
}

/**
 * Sort cards by number, handling non-numeric card numbers
 */
export function sortCardsByNumber(cards: TrackerCard[]): TrackerCard[] {
  return [...cards].sort((a, b) => {
    // Try to parse as numbers first
    const numA = parseInt(a.number, 10);
    const numB = parseInt(b.number, 10);

    // If both are valid numbers, sort numerically
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
      // If same number, sort by variant type (NORMAL before REVERSE_HOLO)
      return a.variant_type.localeCompare(b.variant_type);
    }

    // If one or both aren't numbers, sort alphabetically
    const strCompare = a.number.localeCompare(b.number, undefined, {
      numeric: true,
    });
    if (strCompare !== 0) return strCompare;

    // Same number, sort by variant type
    return a.variant_type.localeCompare(b.variant_type);
  });
}

/**
 * Filter cards based on tracker preferences
 */
export function filterCardsByPreferences(
  cards: TrackerCard[],
  includePromos: boolean,
  includeReverseHolos: boolean
): TrackerCard[] {
  return cards.filter((card) => {
    // Filter out promos if not included
    if (!includePromos && card.is_promo) {
      return false;
    }

    // Only include NORMAL variants, or REVERSE_HOLO if enabled
    if (card.variant_type === "NORMAL") {
      return true;
    }

    if (card.variant_type === "REVERSE_HOLO" && includeReverseHolos) {
      return true;
    }

    return false;
  });
}

/**
 * Get missing cards from a set of tracker cards
 */
export function getMissingCards(cards: TrackerCard[]): TrackerCard[] {
  return cards.filter((card) => !card.owned);
}

/**
 * Get grid columns CSS class for slot configuration
 */
export function getGridColsClass(slotConfig: SlotConfig): string {
  const cols = SLOT_CONFIGS[slotConfig].cols;
  switch (cols) {
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    default:
      return "grid-cols-3";
  }
}

/**
 * Get the number of rows for a slot configuration
 */
export function getGridRows(slotConfig: SlotConfig): number {
  return SLOT_CONFIGS[slotConfig].rows;
}

/**
 * Format variant type for display
 */
export function formatVariantType(variantType: string): string {
  return variantType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get the page index (0-based) for a specific card variant
 */
export function getPageForCard(
  cards: TrackerCard[],
  variantId: string,
  slotConfig: SlotConfig
): number {
  const cardIndex = cards.findIndex((c) => c.variant_id === variantId);
  if (cardIndex === -1) return 0;

  const slotsPerPage = SLOT_CONFIGS[slotConfig].total;
  return Math.floor(cardIndex / slotsPerPage);
}

/**
 * Get the view index for desktop (2 pages per spread) or mobile (1 page)
 */
export function getViewForCard(
  cards: TrackerCard[],
  variantId: string,
  slotConfig: SlotConfig,
  pagesPerView: number
): number {
  const pageIndex = getPageForCard(cards, variantId, slotConfig);
  return Math.floor(pageIndex / pagesPerView);
}
