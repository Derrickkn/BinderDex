/**
 * View Mode Toggle Component
 *
 * Toggle between grid and list view modes for card display.
 * Grid: Default card grid layout with virtual scrolling
 * List: Compact horizontal card list (future implementation)
 */

"use client"

import { Grid3X3, List } from "lucide-react"
import { useFilterStore } from "@/stores/filterStore"
import { cn } from "@/lib/utils"

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useFilterStore()

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-700 rounded-lg">
      {/* Grid view button */}
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
          viewMode === "grid"
            ? "bg-indigo-600 text-white"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      {/* List view button */}
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
          viewMode === "list"
            ? "bg-indigo-600 text-white"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  )
}
