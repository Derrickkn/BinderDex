"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetVariantsWithCollection } from "@/lib/tracker/actions";
import { TrackerPreferences } from "@/lib/types/tracker";

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
      // OPTIMIZED: Single query with LEFT JOIN, no client-side merge needed
      const result = await getSetVariantsWithCollection(setId, preferences);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    },
    enabled: !!setId,
  });
}
