"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTrackerPreferences,
  updateTrackerPreferences,
} from "@/lib/tracker/actions";
import { TrackerPreferences } from "@/lib/types/tracker";
import { useTrackerStore } from "@/hooks/useTrackerStore";
import { useEffect, useCallback } from "react";

export const preferencesKeys = {
  all: ["preferences"] as const,
  set: (setId: string) => [...preferencesKeys.all, setId] as const,
};

export function useTrackerPreferences(setId: string) {
  const queryClient = useQueryClient();
  const { setPreferences } = useTrackerStore();

  const query = useQuery({
    queryKey: preferencesKeys.set(setId),
    queryFn: async () => {
      const result = await getTrackerPreferences(setId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!setId,
  });

  // Sync preferences to store when loaded
  useEffect(() => {
    if (query.data) {
      setPreferences(query.data);
    }
  }, [query.data, setPreferences]);

  const mutation = useMutation({
    mutationFn: async (newPreferences: Partial<TrackerPreferences>) => {
      const result = await updateTrackerPreferences(setId, newPreferences);
      if (result.error) {
        throw new Error(result.error);
      }
      return newPreferences;
    },
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: preferencesKeys.set(setId) });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<TrackerPreferences>(
        preferencesKeys.set(setId)
      );

      // Optimistically update the query cache
      queryClient.setQueryData<TrackerPreferences>(
        preferencesKeys.set(setId),
        (old) => (old ? { ...old, ...newPreferences } : old)
      );

      return { previousPreferences };
    },
    onError: (_err, _newPrefs, context) => {
      // Roll back to previous value on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          preferencesKeys.set(setId),
          context.previousPreferences
        );
        // Also roll back the store
        setPreferences(context.previousPreferences);
      }
      console.error("Failed to save preferences:", _err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: preferencesKeys.set(setId) });
    },
  });

  // Wrapped mutate that also updates local store optimistically
  const updatePreferences = useCallback(
    (newPreferences: Partial<TrackerPreferences>) => {
      // Update local store immediately
      setPreferences(newPreferences);
      // Then save to server
      mutation.mutate(newPreferences);
    },
    [mutation, setPreferences]
  );

  return {
    ...query,
    updatePreferences,
    isUpdating: mutation.isPending,
    saveError: mutation.error,
  };
}
