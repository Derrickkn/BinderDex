/**
 * Browse Header Component
 *
 * Sticky header for Browse Cards page with navigation and stats.
 * Matches TrackerHeader design pattern for visual consistency.
 */

"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrowseHeaderProps {
  totalCards: number
  filteredCount: number
  hasActiveFilters: boolean
}

export function BrowseHeader({
  totalCards,
  filteredCount,
  hasActiveFilters,
}: BrowseHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Icon */}
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-600/20 text-indigo-400 shrink-0">
            <Search className="h-4 w-4" />
          </div>

          {/* Page info */}
          <div className="flex-1 min-w-0">
            {/* Title and count in one line */}
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-sm font-semibold text-white">Browse Cards</h1>
              <span className="text-xs text-zinc-500 shrink-0">·</span>
              <span className="text-xs text-zinc-400 tabular-nums shrink-0">
                {hasActiveFilters ? (
                  <>
                    {filteredCount.toLocaleString()} of {totalCards.toLocaleString()}
                  </>
                ) : (
                  <>{totalCards.toLocaleString()} cards</>
                )}
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-zinc-500 truncate">
              {hasActiveFilters ? "Filtered results" : "All unique cards"}
            </p>
          </div>

          {/* Navigation links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/tracker"
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              Tracker
            </Link>
            <Link
              href="/browse"
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
              )}
              aria-current="page"
            >
              Browse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

// Loading skeleton for BrowseHeader
export function BrowseHeaderSkeleton() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-8 w-8 rounded-md bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-8 w-8 rounded-md bg-zinc-800/30 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
          </div>
          <div className="hidden md:flex gap-1">
            <div className="h-7 w-16 rounded-md bg-zinc-800 animate-pulse" />
            <div className="h-7 w-16 rounded-md bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
