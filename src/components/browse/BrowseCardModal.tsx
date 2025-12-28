/**
 * Browse Card Modal Component
 *
 * Optimized card detail modal for Browse Cards feature.
 * Displays card information with clear visual hierarchy and intuitive navigation.
 *
 * UX Improvements:
 * - Navigation in header (always visible)
 * - Clear typography hierarchy
 * - Inline set reference under card name
 * - Semantic badge colors
 * - Scannable detail rows
 */

"use client"

import { useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { BottomSheet } from "@/components/ui/Modal"
import type { BrowseCard } from "@/lib/types/browse"
import { cn } from "@/lib/utils"

interface BrowseCardModalProps {
  card: BrowseCard | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (direction: "prev" | "next") => void
  canNavigatePrev?: boolean
  canNavigateNext?: boolean
}

// Type badge semantic colors
const getTypeBadgeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Fire: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Grass: "bg-green-500/20 text-green-400 border-green-500/30",
    Lightning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Psychic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Fighting: "bg-red-700/20 text-red-400 border-red-700/30",
    Darkness: "bg-purple-900/20 text-purple-400 border-purple-900/30",
    Metal: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Dragon: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Fairy: "bg-pink-400/20 text-pink-300 border-pink-400/30",
    Colorless: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  }
  return colors[type] || "bg-zinc-700/20 text-zinc-400 border-zinc-700/30"
}

// Supertype badge colors
const getSupertypeBadgeColor = (supertype: string): string => {
  const colors: Record<string, string> = {
    Pokémon: "bg-indigo-600/20 text-indigo-300 border-indigo-600/30",
    Trainer: "bg-amber-600/20 text-amber-300 border-amber-600/30",
    Energy: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  }
  return colors[supertype] || "bg-zinc-700/20 text-zinc-400 border-zinc-700/30"
}

// Detail row component for consistent metadata formatting
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null

  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
      <span className="text-xs text-zinc-500 uppercase tracking-wide shrink-0 mr-3">{label}</span>
      <span className="text-sm text-zinc-300 text-right break-words">{value}</span>
    </div>
  )
}

export function BrowseCardModal({
  card,
  isOpen,
  onClose,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
}: BrowseCardModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }

      if (onNavigate) {
        if (e.key === "ArrowLeft" && canNavigatePrev) {
          onNavigate("prev")
        } else if (e.key === "ArrowRight" && canNavigateNext) {
          onNavigate("next")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, onNavigate, canNavigatePrev, canNavigateNext])

  if (!card) return null

  const imageUrl = card.image_large || card.image_small

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-3xl"
    >
      {/* Custom header with navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 sm:px-6 py-3 -mt-6 mb-6">
        <h2 className="text-lg font-medium text-white">Card Details</h2>

        <div className="flex items-center gap-2">
          {/* Navigation buttons */}
          {onNavigate && (canNavigatePrev || canNavigateNext) && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => onNavigate("prev")}
                disabled={!canNavigatePrev}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  canNavigatePrev
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    : "text-zinc-700 cursor-not-allowed"
                )}
                aria-label="Previous card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate("next")}
                disabled={!canNavigateNext}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  canNavigateNext
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    : "text-zinc-700 cursor-not-allowed"
                )}
                aria-label="Next card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-5 pb-6 px-4 sm:px-6">
        {/* Card image and primary info */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {/* Card image */}
          <div className="relative w-full sm:w-60 shrink-0 aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-xl mx-auto sm:mx-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${card.name} #${card.number}`}
                fill
                sizes="(max-width: 640px) 90vw, 240px"
                className="object-cover"
                quality={95}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <span className="text-zinc-500 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Card info */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Card name + number + set (Tier 1) */}
            <div>
              <h3 className="font-bold text-white text-xl sm:text-2xl leading-tight break-words">
                {card.name}
              </h3>
              <p className="text-sm text-zinc-400 mt-1.5">
                #{card.number}/{card.sets.total}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {card.sets.name}
              </p>
            </div>

            {/* Supertype + Types + HP (Tier 2) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Supertype badge */}
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                    getSupertypeBadgeColor(card.supertype)
                  )}
                >
                  {card.supertype}
                </span>

                {/* Type badges */}
                {card.types?.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                      getTypeBadgeColor(type)
                    )}
                  >
                    {type}
                  </span>
                ))}

                {/* HP (inline with types) */}
                {card.hp && (
                  <span className="text-sm text-white font-semibold ml-auto shrink-0">
                    {card.hp} HP
                  </span>
                )}
              </div>

              {/* Rarity */}
              <p className="text-sm text-zinc-300">
                <span className="text-zinc-500">Rarity:</span> <span className="font-medium">{card.rarity}</span>
              </p>
            </div>

            {/* Special status badges (if any) */}
            {(card.is_legendary || card.is_mythical || card.is_promo) && (
              <div className="flex flex-wrap gap-1.5">
                {card.is_legendary && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-300 border border-purple-500/40">
                    Legendary
                  </span>
                )}
                {card.is_mythical && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-pink-600/30 to-pink-500/20 text-pink-300 border border-pink-500/40">
                    Mythical
                  </span>
                )}
                {card.is_promo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-orange-600/30 to-orange-500/20 text-orange-300 border border-orange-500/40">
                    Promo
                  </span>
                )}
              </div>
            )}

            {/* Additional details (Tier 3) */}
            <div className="space-y-0">
              <DetailRow label="Artist" value={card.artist} />
              <DetailRow
                label="Stage"
                value={card.subtypes && card.subtypes.length > 0 ? card.subtypes.join(", ") : null}
              />
              <DetailRow
                label="Generation"
                value={card.generation ? `Gen ${card.generation}` : null}
              />
              <DetailRow
                label="Pokédex"
                value={
                  card.national_dex_numbers && card.national_dex_numbers.length > 0
                    ? card.national_dex_numbers.map((n) => `#${n}`).join(", ")
                    : null
                }
              />
            </div>
          </div>
        </div>

        {/* Set information (Tier 4) */}
        <div className="pt-4 border-t border-zinc-800/50">
          <h4 className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold mb-2.5">
            Set Information
          </h4>

          <div className="flex items-center gap-4">
            {/* Set logo */}
            {card.sets.logo_url && (
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-900/50 p-2 ring-1 ring-zinc-800">
                <Image
                  src={card.sets.logo_url}
                  alt={`${card.sets.name} logo`}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm break-words">{card.sets.name}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {card.sets.series} <span className="text-zinc-600 mx-1">•</span> {card.sets.era}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Released{" "}
                {new Date(card.sets.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
