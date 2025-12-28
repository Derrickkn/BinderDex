"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  toggleCardOwned,
  updateCollectionEntry,
  untrackPromo,
  getHiddenPromoCount,
  getHiddenPromos,
  restorePromo,
  resetPromoPreferences,
} from "@/lib/tracker";
import { CollectionEntryUpdate, TrackerCard, TrackerPreferences } from "@/lib/types/tracker";
import { variantKeys } from "./useSetVariants";
import { setKeys } from "./useAvailableSets";
import { toast } from "sonner";

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
    onError: (err, _variantId, context) => {
      // Rollback to previous state on error
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to update card');
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
    onError: (err, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
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
      // Show success toast
      toast.success('Changes saved successfully');
    },
  });
}

/**
 * Optimistic-first promo untrack hook.
 * UI updates instantly by removing the promo card from the list and adding it to hidden promos.
 */
export function useUntrackPromo(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  // Use the exact same query key as useSetVariants
  const queryKey = variantKeys.withPreferences(setId, preferences);
  const hiddenPromosQueryKey = ["hidden-promos-list", setId];

  return useMutation({
    mutationFn: async (promoId: string) => {
      const result = await untrackPromo(promoId, setId);
      if (result.error) {
        throw new Error(result.error);
      }
      return { promoId };
    },
    onMutate: async (promoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: hiddenPromosQueryKey });

      // Snapshot previous values for rollback
      const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);
      const previousHiddenPromos = queryClient.getQueryData<TrackerCard[]>(hiddenPromosQueryKey);

      // Find the card being hidden
      const cardToHide = previousCards?.find((card) => card.promo_id === promoId);

      // Optimistically remove the promo card from the main list
      queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((card) => card.promo_id !== promoId);
      });

      // Optimistically add to hidden promos list
      if (cardToHide) {
        queryClient.setQueryData<TrackerCard[]>(hiddenPromosQueryKey, (old) => {
          if (!old) return [cardToHide];
          return [...old, cardToHide];
        });
      }

      return { previousCards, previousHiddenPromos, promoId };
    },
    onError: (err, _promoId, context) => {
      // Rollback to previous state on error
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
      if (context?.previousHiddenPromos) {
        queryClient.setQueryData(hiddenPromosQueryKey, context.previousHiddenPromos);
      }
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to hide promo');
    },
    onSuccess: () => {
      // Invalidate hidden promo count to show new count
      queryClient.invalidateQueries({
        queryKey: ["hidden-promos", setId]
      });
      // Background sync for tracked sets and progress
      queryClient.invalidateQueries({
        queryKey: setKeys.tracked(),
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: setKeys.progress(),
        refetchType: 'none'
      });
      // Show success toast
      toast.success('Promo hidden successfully');
    },
  });
}

/**
 * Hook to get hidden promo count for a set
 */
export function useHiddenPromoCount(setId: string) {
  return useQuery({
    queryKey: ["hidden-promos", setId],
    queryFn: async () => {
      const result = await getHiddenPromoCount(setId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || 0;
    },
  });
}

/**
 * Hook to reset hidden promos for a set
 */
export function useResetHiddenPromos(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  const queryKey = variantKeys.withPreferences(setId, preferences);

  return useMutation({
    mutationFn: async () => {
      const result = await resetPromoPreferences(setId);
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onError: (err) => {
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to restore promos');
    },
    onSuccess: () => {
      // Invalidate hidden promo count
      queryClient.invalidateQueries({ queryKey: ["hidden-promos", setId] });
      // Invalidate hidden promos list
      queryClient.invalidateQueries({ queryKey: ["hidden-promos-list", setId] });
      // Refetch variants to show restored promos
      queryClient.invalidateQueries({ queryKey });
      // Update progress
      queryClient.invalidateQueries({
        queryKey: setKeys.progress(),
        refetchType: 'none'
      });
      // Show success toast
      toast.success('All promos restored successfully');
    },
  });
}

/**
 * Hook to fetch hidden promo cards for a set
 */
export function useHiddenPromos(setId: string) {
  return useQuery({
    queryKey: ["hidden-promos-list", setId],
    queryFn: async () => {
      const result = await getHiddenPromos(setId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
  });
}

/**
 * Hook to restore a single hidden promo
 */
export function useRestorePromo(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient();
  const queryKey = variantKeys.withPreferences(setId, preferences);
  const hiddenPromosQueryKey = ["hidden-promos-list", setId];

  return useMutation({
    mutationFn: async (promoId: string) => {
      const result = await restorePromo(promoId, setId);
      if (result.error) {
        throw new Error(result.error);
      }
      return { promoId };
    },
    onMutate: async (promoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: hiddenPromosQueryKey });
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous values for rollback
      const previousHiddenPromos = queryClient.getQueryData<TrackerCard[]>(hiddenPromosQueryKey);
      const previousCards = queryClient.getQueryData<TrackerCard[]>(queryKey);

      // Find the card being restored
      const cardToRestore = previousHiddenPromos?.find((card) => card.promo_id === promoId);

      // Optimistically remove the promo from hidden list
      queryClient.setQueryData<TrackerCard[]>(hiddenPromosQueryKey, (old) => {
        if (!old) return old;
        return old.filter((card) => card.promo_id !== promoId);
      });

      // Optimistically add back to main cards list
      if (cardToRestore) {
        queryClient.setQueryData<TrackerCard[]>(queryKey, (old) => {
          if (!old) return [cardToRestore];
          // Add it back to the end (promos are typically at the end)
          return [...old, cardToRestore];
        });
      }

      return { previousHiddenPromos, previousCards, promoId };
    },
    onError: (err, _promoId, context) => {
      // Rollback to previous state on error
      if (context?.previousHiddenPromos) {
        queryClient.setQueryData(hiddenPromosQueryKey, context.previousHiddenPromos);
      }
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards);
      }
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to restore promo');
    },
    onSuccess: () => {
      // Invalidate hidden promo count
      queryClient.invalidateQueries({
        queryKey: ["hidden-promos", setId]
      });
      // Update progress
      queryClient.invalidateQueries({
        queryKey: setKeys.progress(),
        refetchType: 'none'
      });
      // Show success toast
      toast.success('Promo restored successfully');
    },
  });
}
