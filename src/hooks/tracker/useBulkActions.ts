"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSetRarities,
  getSetReverseHoloRarities,
  bulkMarkAsOwned,
  bulkUnmarkOwned,
  BulkMarkCriteria,
} from "@/lib/tracker/actions";
import { TrackerCard, TrackerPreferences } from "@/lib/types/tracker";
import { variantKeys } from "./useSetVariants";
import { setKeys } from "./useAvailableSets";

export type BulkActionResult = { count: number; error: string | null };

export function useBulkActions(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  const queryKey = variantKeys.set(setId);

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

  /**
   * OPTIMISTIC UPDATE: Apply bulk mark to cache immediately
   * Returns rollback function and count of cards that will be marked
   */
  const applyOptimisticMark = async (
    matchFn: (card: TrackerCard) => boolean
  ): Promise<{ rollback: () => void; count: number }> => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot for rollback
    const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);
    let count = 0;

    // Optimistically update cache
    queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
      if (!old) return old;
      return old.map((card) => {
        if (matchFn(card) && !card.owned) {
          count++;
          return { ...card, owned: true, quantity: 1 };
        }
        return card;
      });
    });

    return {
      rollback: () => {
        if (previousCards) {
          queryClient.setQueryData(queryKey, previousCards);
        }
      },
      count,
    };
  };

  /**
   * OPTIMISTIC UPDATE: Apply bulk unmark to cache immediately
   */
  const applyOptimisticUnmark = async (
    matchFn: (card: TrackerCard) => boolean
  ): Promise<{ rollback: () => void; count: number }> => {
    await queryClient.cancelQueries({ queryKey });

    const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);
    let count = 0;

    queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
      if (!old) return old;
      return old.map((card) => {
        if (matchFn(card) && card.owned) {
          count++;
          return { ...card, owned: false, quantity: 0 };
        }
        return card;
      });
    });

    return {
      rollback: () => {
        if (previousCards) {
          queryClient.setQueryData(queryKey, previousCards);
        }
      },
      count,
    };
  };

  /**
   * Background sync: Update progress without blocking UI
   */
  const syncProgressInBackground = () => {
    queryClient.invalidateQueries({
      queryKey: setKeys.tracked(),
      refetchType: 'none'
    });
    queryClient.invalidateQueries({
      queryKey: setKeys.progress(),
      refetchType: 'none'
    });
  };

  // Mark cards by rarity - OPTIMISTIC
  const markByRarity = async (rarity: string): Promise<BulkActionResult> => {
    // Match function: NORMAL variants of this rarity that aren't owned
    const matchFn = (card: TrackerCard) =>
      card.rarity?.toLowerCase() === rarity.toLowerCase() &&
      card.variant_type === "NORMAL";

    const { rollback, count } = await applyOptimisticMark(matchFn);

    // Server sync in background
    const criteria: BulkMarkCriteria = { type: "rarity", rarity };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);

    if (result.error) {
      rollback();
      return { count: 0, error: result.error };
    }

    syncProgressInBackground();
    return { count, error: null };
  };

  // Mark reverse holos by rarity - OPTIMISTIC
  const markReverseHolosByRarity = async (rarity: string): Promise<BulkActionResult> => {
    const matchFn = (card: TrackerCard) =>
      card.variant_type === "REVERSE_HOLO" &&
      card.rarity?.toLowerCase() === rarity.toLowerCase();

    const { rollback, count } = await applyOptimisticMark(matchFn);

    const criteria: BulkMarkCriteria = { type: "variantWithRarity", variantType: "REVERSE_HOLO", rarity };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);

    if (result.error) {
      rollback();
      return { count: 0, error: result.error };
    }

    syncProgressInBackground();
    return { count, error: null };
  };

  // Mark all cards in set - OPTIMISTIC
  const markAll = async (): Promise<BulkActionResult> => {
    const matchFn = () => true; // Match all cards

    const { rollback, count } = await applyOptimisticMark(matchFn);

    const criteria: BulkMarkCriteria = { type: "all" };
    const result = await bulkMarkAsOwned(setId, criteria, preferences);

    if (result.error) {
      rollback();
      return { count: 0, error: result.error };
    }

    syncProgressInBackground();
    return { count, error: null };
  };

  // Clear all cards in set - OPTIMISTIC
  const clearAll = async (): Promise<BulkActionResult> => {
    const matchFn = () => true; // Match all cards

    const { rollback, count } = await applyOptimisticUnmark(matchFn);

    const criteria: BulkMarkCriteria = { type: "all" };
    const result = await bulkUnmarkOwned(setId, criteria, preferences);

    if (result.error) {
      rollback();
      return { count: 0, error: result.error };
    }

    syncProgressInBackground();
    return { count, error: null };
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
