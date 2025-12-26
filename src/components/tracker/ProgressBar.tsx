"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  ownedCount: number;
  totalCount: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  percentage,
  ownedCount,
  totalCount,
  className,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-zinc-400">
            {ownedCount} / {totalCount} cards
          </span>
          <span className="text-green-400 font-medium">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Compact version for inline use
export function ProgressBarCompact({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-zinc-400",
        className
      )}
    >
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-green-400 font-medium">{percentage}%</span>
    </div>
  );
}
