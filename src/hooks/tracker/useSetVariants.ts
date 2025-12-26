"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetVariants, getUserCollectionForSet } from "@/lib/tracker/actions";
import { TrackerPreferences, TrackerCard, CardWithVariant } from "@/lib/types/tracker";

export const variantKeys = {
  all: ["variants"] as const,
  set: (setId: string) => [...variantKeys.all, setId] as const,
  withPreferences: (setId: string, preferences: TrackerPreferences) =>
    [...variantKeys.set(setId), preferences] as const,
};

export function useSetVariants(setId: string, preferences: TrackerPreferences) {
  return useQuery({
    queryKey: variantKeys.withPreferences(setId, preferences),
    queryFn: async () => {
      // Fetch variants and collection in parallel
      const [variantsResult, collectionResult] = await Promise.all([
        getSetVariants(setId, preferences),
        getUserCollectionForSet(setId),
      ]);

      if (variantsResult.error) {
        throw new Error(variantsResult.error);
      }

      if (collectionResult.error) {
        throw new Error(collectionResult.error);
      }

      const variants = variantsResult.data || [];
      const collection = collectionResult.data || new Map();

      // Merge variants with collection data
      const trackerCards: TrackerCard[] = variants.map((variant: CardWithVariant) => {
        const collectionEntry = collection.get(variant.variant_id);

        return {
          ...variant,
          owned: collectionEntry?.quantity ? collectionEntry.quantity > 0 : false,
          quantity: collectionEntry?.quantity || 0,
          condition: collectionEntry?.condition || null,
          notes: collectionEntry?.notes || null,
          acquired_date: collectionEntry?.acquired_date || null,
          collection_id: collectionEntry?.collection_id || null,
        };
      });

      return trackerCards;
    },
    enabled: !!setId,
  });
}
