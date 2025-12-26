"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSetRarities,
  getSetReverseHoloRarities,
  bulkMarkAsOwned,
  bulkUnmarkOwned,
  BulkMarkCriteria,
} from "@/lib/tracker/actions";
import { TrackerPreferences } from "@/lib/types/tracker";
import { variantKeys } from "./useSetVariants";
import { setKeys } from "./useAvailableSets";

export type BulkActionResult = { count: number; error: string | null };

export function useBulkActions(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();

  // Fetch available rarities for the set
  const { data: rarities = [] } = useQuery({
    queryKey: ["setRarities", setId],
    queryFn: async () => {
      const result = await getSetRarities(setId);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!setId,
  });

  // Fetch rarities that have reverse holo variants
  const { data: reverseHoloRarities = [] } = useQuery({
    queryKey: ["setReverseHoloRarities", setId],
    queryFn: async () => {
      const result = await getSetReverseHoloRarities(setId);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!setId,
  });

  // Helper to invalidate queries after bulk action
  const invalidateAfterBulk = () => {
    // Invalidate the variants query to refresh the UI
    queryClient.invalidateQueries({
      queryKey: variantKeys.withPreferences(setId, preferences),
    });
    // Also invalidate progress
    queryClient.invalidateQueries({ queryKey: setKeys.progress() });
  };

  // Mark cards by rarity
  const markByRarity = async (rarity: string): Promise<BulkActionResult> => {
    const criteria: BulkMarkCriteria = { type: "rarity", rarity };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);
    if (result.error) return { count: 0, error: result.error };
    invalidateAfterBulk();
    return { count: result.count, error: null };
  };

  // Mark reverse holos by rarity (e.g., Common Reverse Holos, Uncommon Reverse Holos)
  const markReverseHolosByRarity = async (rarity: string): Promise<BulkActionResult> => {
    const criteria: BulkMarkCriteria = { type: "variantWithRarity", variantType: "REVERSE_HOLO", rarity };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);
    if (result.error) return { count: 0, error: result.error };
    invalidateAfterBulk();
    return { count: result.count, error: null };
  };

  // Mark all cards in set
  const markAll = async (): Promise<BulkActionResult> => {
    const criteria: BulkMarkCriteria = { type: "all" };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);
    if (result.error) return { count: 0, error: result.error };
    invalidateAfterBulk();
    return { count: result.count, error: null };
  };

  // Clear all cards in set
  const clearAll = async (): Promise<BulkActionResult> => {
    const criteria: BulkMarkCriteria = { type: "all" };
    const result = await bulkUnmarkOwned(setId, criteria, preferences);
    if (result.error) return { count: 0, error: result.error };
    invalidateAfterBulk();
    return { count: result.count, error: null };
  };

  return {
    rarities,
    reverseHoloRarities,
    markByRarity,
    markReverseHolosByRarity,
    markAll,
    clearAll,
  };
}
