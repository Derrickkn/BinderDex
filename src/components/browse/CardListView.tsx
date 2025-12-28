/**
 * Card List View Component
 *
 * Compact horizontal list layout for displaying browse cards.
 * Alternative view mode to the grid layout.
 */

"use client"

import { useCallback } from "react"
import { FixedSizeList } from "react-window"
import type { BrowseCard } from "@/lib/types/browse"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CardListViewProps {
  cards: BrowseCard[]
  onCardClick: (cardId: string) => void
  className?: string
}

interface CardListItemProps {
  card: BrowseCard
  onClick: (cardId: string) => void
}

function CardListItem({ card, onClick }: CardListItemProps) {
  return (
    <button
      onClick={() => onClick(card.id)}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 text-left",
        "hover:bg-zinc-800/50 transition-colors",
        "border-b border-zinc-800 last:border-b-0",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      )}
    >
      {/* Card thumbnail */}
      <div className="flex-shrink-0 w-12 h-16 relative rounded overflow-hidden bg-zinc-800">
        {card.image_small ? (
          <Image
            src={card.image_small}
            alt={card.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate">{card.name}</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {card.sets.name} - #{card.number}
        </p>
      </div>

      {/* Card metadata */}
      <div className="flex-shrink-0 flex items-center gap-4">
        {/* Rarity */}
        <span className="text-xs text-zinc-500 hidden sm:block w-24 text-right">
          {card.rarity || "Unknown"}
        </span>

        {/* Type */}
        {card.types && card.types.length > 0 && (
          <span className="text-xs text-zinc-500 hidden md:block w-20 text-right">
            {card.types.join(", ")}
          </span>
        )}

        {/* Arrow indicator */}
        <svg
          className="w-4 h-4 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  )
}

export function CardListView({
  cards,
  onCardClick,
  className,
}: CardListViewProps) {
  // Row height for list items
  const ROW_HEIGHT = 76

  // Calculate list height
  const listHeight = Math.min(
    Math.max(600, window.innerHeight - 300),
    cards.length * ROW_HEIGHT
  )

  // Row renderer for virtualized list
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const card = cards[index]
      if (!card) return null

      return (
        <div style={style}>
          <CardListItem card={card} onClick={onCardClick} />
        </div>
      )
    },
    [cards, onCardClick]
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

  return (
    <div
      className={cn("w-full bg-zinc-900/50 rounded-lg border border-zinc-800", className)}
      role="list"
      aria-label={`Card list showing ${cards.length} cards`}
    >
      <FixedSizeList
        height={listHeight}
        itemCount={cards.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600"
      >
        {Row}
      </FixedSizeList>
    </div>
  )
}
