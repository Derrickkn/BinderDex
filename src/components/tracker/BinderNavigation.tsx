"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BinderNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function BinderNavigation({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: BinderNavigationProps) {
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div data-coach-navigation className="flex items-center justify-center gap-4 py-4">
      {/* Previous button */}
      <button
        onClick={onPrevPage}
        disabled={!canGoPrev}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
          canGoPrev
            ? "border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            : "border-zinc-800 text-zinc-700 cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white font-medium">{currentPage + 1}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-500">{totalPages}</span>
      </div>

      {/* Next button */}
      <button
        onClick={onNextPage}
        disabled={!canGoNext}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
          canGoNext
            ? "border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            : "border-zinc-800 text-zinc-700 cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

// Compact version for smaller screens
export function BinderNavigationCompact({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: BinderNavigationProps) {
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <button
        onClick={onPrevPage}
        disabled={!canGoPrev}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          canGoPrev
            ? "text-zinc-400 hover:text-white"
            : "text-zinc-700 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Prev</span>
      </button>

      <span className="text-sm text-zinc-500">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        onClick={onNextPage}
        disabled={!canGoNext}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          canGoNext
            ? "text-zinc-400 hover:text-white"
            : "text-zinc-700 cursor-not-allowed"
        )}
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
