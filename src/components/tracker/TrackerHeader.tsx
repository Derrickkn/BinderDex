"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SetWithCardCount, TrackerProgress } from "@/lib/types/tracker";

interface TrackerHeaderProps {
  set: SetWithCardCount;
  progress: TrackerProgress;
}

export function TrackerHeader({
  set,
  progress,
}: TrackerHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        {/* Single row: Back, Set info, Progress */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back link */}
          <Link
            href="/tracker"
            className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Set logo */}
          <div className="relative h-8 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">
            {set.logo_url ? (
              <Image
                src={set.logo_url}
                alt={set.name}
                width={56}
                height={32}
                className="object-contain"
              />
            ) : set.symbol_url ? (
              <Image
                src={set.symbol_url}
                alt={set.name}
                width={28}
                height={28}
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-zinc-500">
                {set.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Set details with inline progress */}
          <div className="flex-1 min-w-0">
            {/* Set name and progress in one line */}
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-sm font-semibold text-white truncate">{set.name}</h1>
              <span className="text-xs text-zinc-500 shrink-0">·</span>
              <span className="text-xs text-zinc-400 tabular-nums shrink-0">
                {progress.ownedCards}/{progress.totalCards}
              </span>
              <span className="text-xs text-zinc-500 shrink-0">
                ({progress.percentage}%)
              </span>
            </div>

            {/* Era/Series and progress bar */}
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 truncate">
                {set.era === set.series ? set.era : `${set.era} • ${set.series}`}
              </p>
              <div className="hidden sm:block w-32 h-1 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Loading skeleton for TrackerHeader
export function TrackerHeaderSkeleton() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-8 w-8 rounded-md bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-10 w-10 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
          </div>
          <div className="hidden sm:block h-1.5 w-24 rounded-full bg-zinc-800 animate-pulse" />
          <div className="h-8 w-8 rounded-md bg-zinc-800 animate-pulse shrink-0" />
        </div>
      </div>
    </header>
  );
}
