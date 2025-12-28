"use client";

import { useQuery } from "@tanstack/react-query";
import { getAvailableSets, getTrackedSetIds, getTrackedSetsProgress } from "@/lib/tracker";

export const setKeys = {
  all: ["sets"] as const,
  available: () => [...setKeys.all, "available"] as const,
  tracked: () => [...setKeys.all, "tracked"] as const,
  progress: () => [...setKeys.all, "progress"] as const,
};

export function useAvailableSets() {
  return useQuery({
    queryKey: setKeys.available(),
    queryFn: async () => {
      const result = await getAvailableSets();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useTrackedSetIds() {
  return useQuery({
    queryKey: setKeys.tracked(),
    queryFn: async () => {
      const result = await getTrackedSetIds();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
  });
}

export function useTrackedSetsProgress() {
  return useQuery({
    queryKey: setKeys.progress(),
    queryFn: async () => {
      const result = await getTrackedSetsProgress();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || {};
    },
  });
}
