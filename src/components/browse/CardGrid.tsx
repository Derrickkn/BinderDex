/**
 * Card Grid Component
 *
 * Virtualized responsive grid layout for displaying browse cards.
 * Phase 1B: Uses react-window FixedSizeGrid for 60 FPS with 4,000+ cards.
 *
 * Performance Optimizations:
 * - Cell renderer is memoized to prevent recreation on filter changes
 * - Uses itemData pattern for stable references to cards and callbacks
 * - Maintains scroll position stability during filter transitions
 */

"use client"

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react"
import { FixedSizeGrid, areEqual } from "react-window"
import type { BrowseCard } from "@/lib/types/browse"
import { CardItem } from "./CardItem"
import { cn } from "@/lib/utils"

interface CardGridProps {
  cards: BrowseCard[]
  onCardClick: (cardId: string) => void
  className?: string
}

// Item data passed to each cell for stable references
interface CellItemData {
  cards: BrowseCard[]
  columnCount: number
  onCardClick: (cardId: string) => void
}

// Cell props from react-window
interface CellProps {
  columnIndex: number
  rowIndex: number
  style: React.CSSProperties
  data: CellItemData
}

/**
 * Memoized Cell component - prevents unnecessary re-renders when cards array changes
 * Uses areEqual from react-window for proper comparison
 */
const Cell = memo(function Cell({ columnIndex, rowIndex, style, data }: CellProps) {
  const { cards, columnCount, onCardClick } = data
  const index = rowIndex * columnCount + columnIndex
  const card = cards[index]

  if (!card) {
    return <div style={style} />
  }

  return (
    <div style={style} className="p-1.5">
      <CardItem card={card} onClick={onCardClick} />
    </div>
  )
}, areEqual)

export function CardGrid({ cards, onCardClick, className }: CardGridProps) {
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on resize and initial mount
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        // Calculate height: viewport height - header - padding
        const height = Math.max(
          600,
          window.innerHeight - 300 // Reserve space for header/footer
        )

        if (width > 0) {
          setDimensions({ width, height })
        }
      }
    }

    // Initial measurement
    updateDimensions()

    // Use ResizeObserver for reliable resize detection
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    // Also listen to window resize for height updates
    window.addEventListener("resize", updateDimensions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Calculate responsive column count based on width
  const columnCount = useMemo(() => {
    if (!dimensions) return 2

    if (dimensions.width < 640) return 2 // Mobile
    if (dimensions.width < 768) return 3 // Tablet
    if (dimensions.width < 1024) return 4 // Small desktop
    if (dimensions.width < 1280) return 6 // Desktop
    return 8 // Large desktop
  }, [dimensions])

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    if (!dimensions) return null

    const rowCount = Math.ceil(cards.length / columnCount)
    const gap = 12 // 3 * 4px (gap-3)
    const columnWidth = Math.floor(
      (dimensions.width - gap * (columnCount - 1)) / columnCount
    )
    // Calculate row height based on card aspect ratio (2.5:3.5 = 0.714)
    const rowHeight = Math.floor(columnWidth * 1.4) + gap

    return { rowCount, columnWidth, rowHeight }
  }, [dimensions, cards.length, columnCount])

  // Memoize the click handler to maintain stable reference
  // Must be called before any early returns to follow React hooks rules
  const handleCardClick = useCallback(
    (cardId: string) => {
      onCardClick(cardId)
    },
    [onCardClick]
  )

  // Create itemData object for the Cell component
  // This passes data to cells without recreating the Cell function
  // Must be called before any early returns to follow React hooks rules
  const itemData = useMemo<CellItemData>(
    () => ({
      cards,
      columnCount,
      onCardClick: handleCardClick,
    }),
    [cards, columnCount, handleCardClick]
  )

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-200 mb-2">
          No cards found
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          Try adjusting your filters or search query to discover more cards.
        </p>
      </div>
    )
  }

  // Loading state - while dimensions are being calculated
  if (!dimensions || !gridDimensions) {
    return (
      <div ref={containerRef} className={cn("w-full min-h-[600px]", className)}>
        {/* Placeholder skeleton while measuring */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2.5/3.5] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      role="grid"
      aria-label={`Card browser grid showing ${cards.length} cards`}
    >
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={gridDimensions.columnWidth}
        height={dimensions.height}
        rowCount={gridDimensions.rowCount}
        rowHeight={gridDimensions.rowHeight}
        width={dimensions.width}
        itemData={itemData}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600"
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  )
}
