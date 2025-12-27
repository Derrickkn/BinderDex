"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getSetVariantsWithCollection } from "@/lib/tracker/actions";
import { TrackerPreferences } from "@/lib/types/tracker";

export const variantKeys = {
  all: ["variants"] as const,
  set: (setId: string) => [...variantKeys.all, setId] as const,
  // Deprecated: kept for backward compatibility with other hooks
  // Use variantKeys.set() instead - preferences are now filtered client-side
  withPreferences: (setId: string, _preferences: TrackerPreferences) =>
    [...variantKeys.all, setId] as const,
};

export function useSetVariants(setId: string, preferences: TrackerPreferences) {
  // OPTIMIZATION: Fetch ALL variants once (query key only includes setId, NOT preferences)
  // This prevents refetching when preferences change
  const allVariantsQuery = useQuery({
    queryKey: variantKeys.set(setId),
    queryFn: async () => {
      // Fetch ALL variants: promos + reverse holos included
      const result = await getSetVariantsWithCollection(setId, {
        slotConfig: preferences.slotConfig,
        includePromos: true, // Always fetch promos
        includeReverseHolos: true, // Always fetch reverse holos
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    },
    enabled: !!setId,
  });

  // OPTIMIZATION: Filter client-side based on preferences
  // This makes preference changes INSTANT (no refetch needed)
  const filteredVariants = useMemo(() => {
    if (!allVariantsQuery.data) return [];

    return allVariantsQuery.data.filter((variant) => {
      // Filter promos based on preference
      if (!preferences.includePromos && variant.is_promo) {
        return false;
      }

      // Filter reverse holos based on preference
      if (!preferences.includeReverseHolos && variant.variant_type === "REVERSE_HOLO") {
        return false;
      }

      return true;
    });
  }, [allVariantsQuery.data, preferences.includePromos, preferences.includeReverseHolos]);

  // Return modified query object with filtered data
  return {
    ...allVariantsQuery,
    data: filteredVariants,
  };
}
