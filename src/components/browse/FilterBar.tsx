/**
 * Filter Bar Component
 *
 * Displays active filters as removable chips with a clear all button.
 * Shows results count and provides quick access to remove individual filters.
 */

"use client"

import { X } from "lucide-react"
import { useFilterStore } from "@/stores/filterStore"
import type { SetWithCardCount } from "@/lib/types/tracker"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  sets: SetWithCardCount[]
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
  className?: string
}

/**
 * Removable filter chip
 */
function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string
  value: string
  onRemove: () => void
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm",
        "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30",
        "transition-colors group"
      )}
    >
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-indigo-600/30 rounded-sm p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}

export function FilterBar({
  sets,
  filteredCount,
  totalCount,
  hasActiveFilters,
  className,
}: FilterBarProps) {
  const {
    searchQuery,
    selectedSets,
    selectedEras,
    selectedTypes,
    selectedRarities,
    selectedGenerations,
    selectedSupertypes,
    legendaryOnly,
    mythicalOnly,
    setSearchQuery,
    toggleSet,
    toggleEra,
    toggleType,
    toggleRarity,
    toggleGeneration,
    toggleSupertype,
    toggleLegendary,
    toggleMythical,
    clearFilters,
  } = useFilterStore()

  // Helper to get set name by ID
  const getSetName = (setId: string) => {
    const set = sets.find((s) => s.id === setId)
    return set?.name || setId
  }

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Active filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search query */}
        {searchQuery && (
          <FilterChip
            label="Search"
            value={searchQuery}
            onRemove={() => setSearchQuery("")}
          />
        )}

        {/* Sets */}
        {selectedSets.map((setId) => (
          <FilterChip
            key={setId}
            label="Set"
            value={getSetName(setId)}
            onRemove={() => toggleSet(setId)}
          />
        ))}

        {/* Eras */}
        {selectedEras.map((era) => (
          <FilterChip
            key={era}
            label="Era"
            value={era}
            onRemove={() => toggleEra(era)}
          />
        ))}

        {/* Types */}
        {selectedTypes.map((type) => (
          <FilterChip
            key={type}
            label="Type"
            value={type}
            onRemove={() => toggleType(type)}
          />
        ))}

        {/* Rarities */}
        {selectedRarities.map((rarity) => (
          <FilterChip
            key={rarity}
            label="Rarity"
            value={rarity}
            onRemove={() => toggleRarity(rarity)}
          />
        ))}

        {/* Generations */}
        {selectedGenerations.map((gen) => (
          <FilterChip
            key={gen}
            label="Generation"
            value={`Gen ${gen}`}
            onRemove={() => toggleGeneration(gen)}
          />
        ))}

        {/* Supertypes */}
        {selectedSupertypes.map((supertype) => (
          <FilterChip
            key={supertype}
            label="Card Type"
            value={supertype}
            onRemove={() => toggleSupertype(supertype)}
          />
        ))}

        {/* Legendary toggle */}
        {legendaryOnly && (
          <FilterChip
            label="Special"
            value="Legendary Pokémon"
            onRemove={toggleLegendary}
          />
        )}

        {/* Mythical toggle */}
        {mythicalOnly && (
          <FilterChip
            label="Special"
            value="Mythical Pokémon"
            onRemove={toggleMythical}
          />
        )}

        {/* Clear all button */}
        <button
          onClick={clearFilters}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
            "text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50",
            "transition-colors"
          )}
        >
          Clear all
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-zinc-400">
        Showing <span className="font-medium text-white">{filteredCount.toLocaleString()}</span> of{" "}
        <span className="font-medium text-white">{totalCount.toLocaleString()}</span> cards
      </p>
    </div>
  )
}
