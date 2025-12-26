"use client";

import { useMemo } from "react";
import { useAvailableSets, useTrackedSetIds, useTrackedSetsProgress } from "@/hooks/tracker";
import { SetCard, SetCardSkeleton } from "./SetCard";
import { BlurFade } from "@/components/magicui/blur-fade";

export function SetSelector() {
  const { data: sets, isLoading: isLoadingSets, error: setsError } = useAvailableSets();
  const { data: trackedIds, isLoading: isLoadingTracked } = useTrackedSetIds();
  const { data: progress } = useTrackedSetsProgress();

  const isLoading = isLoadingSets || isLoadingTracked;
  const error = setsError;

  // Separate sets into tracking and untracked
  const { trackingSets, untrackedSets } = useMemo(() => {
    if (!sets) return { trackingSets: [], untrackedSets: [] };

    const trackedSet = new Set(trackedIds || []);
    const tracking = sets.filter((s) => trackedSet.has(s.id));
    const untracked = sets.filter((s) => !trackedSet.has(s.id));

    return { trackingSets: tracking, untrackedSets: untracked };
  }, [sets, trackedIds]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-6 w-32 rounded bg-zinc-800 animate-pulse mb-4" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-red-400">Failed to load sets: {error.message}</p>
      </div>
    );
  }

  if (!sets || sets.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-zinc-400 mb-2">No sets available yet</p>
        <p className="text-sm text-zinc-500">
          Run the data import to add card sets to the database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Tracking Section - Only show if user has tracked sets */}
      {trackingSets.length > 0 && (
        <section>
          <BlurFade delay={0.05} inView>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Your Collection
              </h3>
              <span className="text-sm text-zinc-600">
                {trackingSets.length} set{trackingSets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trackingSets.map((set, index) => (
              <BlurFade key={set.id} delay={0.05 + 0.05 * index} inView>
                <SetCard
                  set={set}
                  isTracking
                  progress={progress?.[set.id]}
                />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {/* All/Untracked Sets Section */}
      <section>
        <BlurFade delay={trackingSets.length > 0 ? 0.1 : 0.05} inView>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-medium text-zinc-400">
              {trackingSets.length > 0 ? "Untracked Sets" : "All Sets"}
            </h3>
            <span className="text-sm text-zinc-600">
              {untrackedSets.length} set{untrackedSets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </BlurFade>
        {untrackedSets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {untrackedSets.map((set, index) => (
              <BlurFade
                key={set.id}
                delay={(trackingSets.length > 0 ? 0.15 : 0.1) + 0.05 * index}
                inView
              >
                <SetCard set={set} />
              </BlurFade>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
            <p className="text-zinc-500 text-sm">
              All available sets are being tracked!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
