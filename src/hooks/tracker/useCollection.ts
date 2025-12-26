"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleCardOwned,
  updateCollectionEntry,
} from "@/lib/tracker/actions";
import { CollectionEntryUpdate, TrackerCard, TrackerPreferences } from "@/lib/types/tracker";
import { variantKeys } from "./useSetVariants";
import { setKeys } from "./useAvailableSets";

/**
 * Optimistic-first card toggle hook.
 * UI updates instantly, server sync happens in background.
 * No refetching - we trust the optimistic state.
 * Only rollback on actual server errors.
 */
export function useToggleOwned(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  // Use the exact same query key as useSetVariants
  const queryKey = variantKeys.withPreferences(setId, preferences);

  return useMutation({
    mutationFn: async (variantId: string) => {
      const result = await toggleCardOwned(variantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return { variantId, ...result.data };
    },
    onMutate: async (variantId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);

      // Optimistically update the UI immediately
      queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((card) => {
          if (card.variant_id === variantId) {
            const newOwned = !card.owned;
            return {
              ...card,
              owned: newOwned,
              quantity: newOwned ? 1 : 0,
            };
          }
          return card;
        });
      });

      return { previousCards, variantId };
    },
    onError: (_err, _variantId, context) => {
      // Rollback to previous state on error
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
    },
    onSuccess: () => {
      // Background sync: update tracked sets and progress without refetching cards
      queryClient.invalidateQueries({
        queryKey: setKeys.tracked(),
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: setKeys.progress(),
        refetchType: 'none'
      });
    },
  });
}

/**
 * Optimistic-first collection entry update hook.
 * For updating quantity, condition, notes, etc.
 */
export function useUpdateCollectionEntry(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  // Use the exact same query key as useSetVariants
  const queryKey = variantKeys.withPreferences(setId, preferences);

  return useMutation({
    mutationFn: async ({
      variantId,
      data,
    }: {
      variantId: string;
      data: CollectionEntryUpdate;
    }) => {
      const result = await updateCollectionEntry(variantId, data);
      if (result.error) {
        throw new Error(result.error);
      }
      return { variantId, data };
    },
    onMutate: async ({ variantId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);

      // Optimistically update the UI immediately
      queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((card) => {
          if (card.variant_id === variantId) {
            return {
              ...card,
              owned: data.quantity > 0,
              quantity: data.quantity,
              condition: data.condition ?? card.condition,
              notes: data.notes ?? card.notes,
              acquired_date: data.acquired_date ?? card.acquired_date,
            };
          }
          return card;
        });
      });

      return { previousCards };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
    },
    onSuccess: () => {
      // Background sync for tracked sets and progress
      queryClient.invalidateQueries({
        queryKey: setKeys.tracked(),
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: setKeys.progress(),
        refetchType: 'none'
      });
    },
  });
}
