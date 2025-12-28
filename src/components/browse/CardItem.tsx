/**
 * Card Item Component
 *
 * Simplified card display for browse view (NO variants, NO ownership state).
 * Displays card image with subtle status indicators and card number overlay.
 *
 * Design Features:
 * - Subtle border glow effects for special card types (Premium, Legendary, Mythical)
 * - Small star icon for promo cards
 * - Card number in "#149/232" format (number/set total)
 * - Clean visual hierarchy with card image as hero element
 *
 * Performance Optimizations:
 * - Memoized to prevent re-renders when parent grid re-renders
 * - Image loaded state keyed by image URL for proper cache behavior
 * - Uses stable callback references via useCallback
 */

"use client"

import Image from "next/image"
import { useState, useCallback, useEffect, memo, useRef } from "react"
import { Star } from "lucide-react"
import type { BrowseCard } from "@/lib/types/browse"
import { cn } from "@/lib/utils"

interface CardItemProps {
  card: BrowseCard
  onClick: (cardId: string) => void
}

// Removed card status styling - all cards now have uniform appearance

/**
 * Memoized CardItem component
 * Uses custom comparison to only re-render when card data changes
 */
export const CardItem = memo(
  function CardItem({ card, onClick }: CardItemProps) {
    const imageUrl = card.image_small || card.image_large

    // Track loaded images by URL to prevent flash on filter changes
    // Using a ref to track the current image URL for comparison
    const prevImageUrlRef = useRef(imageUrl)
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleClick = useCallback(() => {
      onClick(card.id)
    }, [onClick, card.id])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      },
      [handleClick]
    )

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true)
    }, [])

    // Only reset image loaded state when the image URL actually changes
    // This prevents flash when the same card is re-rendered due to filter changes
    useEffect(() => {
      if (prevImageUrlRef.current !== imageUrl) {
        setImageLoaded(false)
        prevImageUrlRef.current = imageUrl
      }
    }, [imageUrl])

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${card.name}, card number ${card.number} of ${card.sets.total}${
          card.is_legendary ? ". Legendary Pokémon" : ""
        }${card.is_mythical ? ". Mythical Pokémon" : ""}${
          card.is_promo ? ". Promotional card" : ""
        }`}
        className={cn(
          // Base styles
          "relative rounded-lg overflow-hidden cursor-pointer",
          // Simple border - no highlights
          "ring-1 ring-zinc-800",
          // Subtle hover effect - no scale or shadow
          "transition-opacity duration-200 ease-out",
          "hover:opacity-90",
          // Focus state for keyboard navigation
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
          // Reduced motion support
          "motion-reduce:transition-none"
        )}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
        )}

        {/* Card image */}
        <div className="aspect-[2.5/3.5]">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={`${card.name} #${card.number}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
              loading="lazy"
              onLoad={handleImageLoad}
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>

        {/* Promo star icon (top-right) */}
        {card.is_promo && (
          <div className="absolute top-2 right-2">
            <Star
              className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Bottom info bar with card number */}
        <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
          {/* Card number in #149/232 format */}
          <span className="text-[11px] font-medium text-white/90 drop-shadow-sm">
            #{card.number}
            <span className="text-white/60">/</span>
            <span className="font-normal text-white/70">{card.sets.total}</span>
          </span>

          {/* Card name - truncated if too long */}
          <span className="text-[10px] text-white/80 truncate ml-2 max-w-[60%]">
            {card.name}
          </span>
        </div>

        {/* Screen reader text for status indicators */}
        <span className="sr-only">
          {card.is_legendary && "Legendary Pokémon. "}
          {card.is_mythical && "Mythical Pokémon. "}
          {card.is_promo && "Promotional card. "}
          Card number {card.number} of {card.sets.total}.
        </span>
      </article>
    )
  },
  // Custom comparison: only re-render if card.id changes
  // onClick is a stable reference from useCallback in parent
  (prevProps, nextProps) => {
    return prevProps.card.id === nextProps.card.id
  }
)
