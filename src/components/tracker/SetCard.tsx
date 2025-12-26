"use client";

import Link from "next/link";
import Image from "next/image";
import { SetWithCardCount } from "@/lib/types/tracker";
import { cn } from "@/lib/utils";

interface SetCardProps {
  set: SetWithCardCount;
  progress?: { ownedCount: number; totalCount: number; percentage: number };
  isTracking?: boolean;
}

export function SetCard({ set, progress, isTracking = false }: SetCardProps) {
  return (
    <Link
      href={`/tracker/${set.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border p-4 transition-all duration-200",
        "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/70",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
      )}
    >
      {/* Set logo and info */}
      <div className="flex items-start gap-3">
        {/* Set symbol/logo */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">
          {set.symbol_url ? (
            <Image
              src={set.symbol_url}
              alt={set.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-zinc-500">
              {set.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Set details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate group-hover:text-zinc-200 transition-colors">
            {set.name}
          </h3>
          <p className="text-sm text-zinc-500 truncate">
            {set.era} • {set.series}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {set.card_count} cards
          </p>
        </div>
      </div>

      {/* Progress bar (if user is tracking this set) */}
      {isTracking && progress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-400">
              {progress.ownedCount} / {progress.totalCount}
            </span>
            <span className="text-zinc-300 font-medium">
              {progress.percentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Link>
  );
}

// Loading skeleton for SetCard
export function SetCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-zinc-800" />
          <div className="h-4 w-1/2 rounded bg-zinc-800" />
          <div className="h-3 w-1/4 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
