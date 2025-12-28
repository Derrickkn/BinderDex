/**
 * Tracker utility functions
 * Helper functions used across tracker queries and mutations
 */

/**
 * Helper function to get sort order for variant types
 * Ensures consistent ordering: NORMAL → REVERSE_HOLO → POKEBALL → MASTERBALL
 */
export function getVariantSortOrder(variantType: string): number {
  const order: Record<string, number> = {
    'NORMAL': 0,
    'REVERSE_HOLO': 1,
    'POKEBALL': 2,
    'MASTERBALL': 3,
    'FIRST_EDITION': 4,
    'SHADOWLESS': 5,
    'UNLIMITED': 6,
  };
  return order[variantType] ?? 99;
}
