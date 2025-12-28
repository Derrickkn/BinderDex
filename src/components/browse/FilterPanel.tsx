/**
 * Filter Panel Component
 *
 * Comprehensive filter UI for Browse Cards feature.
 * Desktop: Fixed sidebar on left
 * Mobile: Bottom drawer (slide up)
 *
 * Includes:
 * - Search input with 300ms debouncing
 * - Multi-select filters (sets, eras, types, rarities, generations, supertypes)
 * - Boolean toggles (premium, legendary, mythical)
 * - Clear all button with active filter count
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useFilterStore } from "@/stores/filterStore"
import { CARD_TYPES, CARD_SUPERTYPES, GENERATIONS } from "@/lib/constants/filters"
import { cn } from "@/lib/utils"
import type { SetWithCardCount } from "@/lib/types/tracker"

interface FilterPanelProps {
  sets: SetWithCardCount[]
  className?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Debounced search input component
 */
function DebouncedSearchInput() {
  const { searchQuery, setSearchQuery } = useFilterStore()
  const [inputValue, setInputValue] = useState(searchQuery)

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, setSearchQuery])

  // Sync with store when external changes occur
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        type="text"
        placeholder="Search cards..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={cn(
          "w-full pl-9 pr-9 py-2 text-sm",
          "bg-zinc-900 border border-zinc-700 rounded-lg",
          "text-white placeholder:text-zinc-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          "transition-colors"
        )}
        aria-label="Search cards by name, number, or artist"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Collapsible filter section
 */
function FilterSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-zinc-800 pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-zinc-200 hover:text-white transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

/**
 * Checkbox filter item
 */
function CheckboxItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn(
          "w-4 h-4 rounded border-zinc-600 bg-zinc-800",
          "text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0",
          "cursor-pointer transition-colors"
        )}
      />
      <span className="flex-1 text-sm text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-zinc-500">{count}</span>
      )}
    </label>
  )
}

/**
 * Chip filter item (for types, generations)
 */
function ChipFilter({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
        active
          ? "bg-indigo-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
      )}
    >
      {label}
    </button>
  )
}

export function FilterPanel({
  sets,
  className,
  isMobile = false,
  isOpen = true,
  onClose,
}: FilterPanelProps) {
  const {
    selectedSets,
    selectedEras,
    selectedTypes,
    selectedRarities,
    selectedGenerations,
    selectedSupertypes,
    legendaryOnly,
    mythicalOnly,
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

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return (
      selectedSets.length +
      selectedEras.length +
      selectedTypes.length +
      selectedRarities.length +
      selectedGenerations.length +
      selectedSupertypes.length +
      (legendaryOnly ? 1 : 0) +
      (mythicalOnly ? 1 : 0)
    )
  }, [
    selectedSets,
    selectedEras,
    selectedTypes,
    selectedRarities,
    selectedGenerations,
    selectedSupertypes,
    legendaryOnly,
    mythicalOnly,
  ])

  // Extract unique eras and rarities from sets
  const uniqueEras = useMemo(() => {
    return Array.from(new Set(sets.map((set) => set.era))).sort()
  }, [sets])

  const uniqueRarities = useMemo(() => {
    // This would ideally come from analyzing all cards
    // For now, return common rarities
    return [
      "Common",
      "Uncommon",
      "Rare",
      "Rare Holo",
      "Double Rare",
      "Illustration Rare",
      "Special Illustration Rare",
      "Hyper Rare",
      "Ultra Rare",
    ]
  }, [])

  // Mobile drawer overlay
  if (isMobile && !isOpen) return null

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Filter panel */}
      <aside
        className={cn(
          "bg-zinc-900 border-zinc-800",
          // Desktop styles
          !isMobile && "w-80 border-r overflow-y-auto",
          // Mobile styles (drawer from bottom)
          isMobile &&
            "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t max-h-[80vh] overflow-y-auto",
          className
        )}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          )}

          {/* Search */}
          <div>
            <DebouncedSearchInput />
          </div>

          {/* Sets */}
          <FilterSection title="Sets" defaultExpanded={selectedSets.length > 0}>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sets.map((set) => (
                <CheckboxItem
                  key={set.id}
                  label={set.name}
                  count={set.card_count}
                  checked={selectedSets.includes(set.id)}
                  onChange={() => toggleSet(set.id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Eras */}
          <FilterSection title="Era" defaultExpanded={selectedEras.length > 0}>
            {uniqueEras.map((era) => (
              <CheckboxItem
                key={era}
                label={era}
                checked={selectedEras.includes(era)}
                onChange={() => toggleEra(era)}
              />
            ))}
          </FilterSection>

          {/* Types */}
          <FilterSection
            title="Type"
            defaultExpanded={selectedTypes.length > 0}
          >
            <div className="flex flex-wrap gap-2">
              {CARD_TYPES.map((type) => (
                <ChipFilter
                  key={type}
                  label={type}
                  active={selectedTypes.includes(type)}
                  onClick={() => toggleType(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Rarities */}
          <FilterSection
            title="Rarity"
            defaultExpanded={selectedRarities.length > 0}
          >
            {uniqueRarities.map((rarity) => (
              <CheckboxItem
                key={rarity}
                label={rarity}
                checked={selectedRarities.includes(rarity)}
                onChange={() => toggleRarity(rarity)}
              />
            ))}
          </FilterSection>

          {/* Generations */}
          <FilterSection
            title="Generation"
            defaultExpanded={selectedGenerations.length > 0}
          >
            <div className="flex flex-wrap gap-2">
              {GENERATIONS.map((gen) => (
                <ChipFilter
                  key={gen}
                  label={`Gen ${gen}`}
                  active={selectedGenerations.includes(gen)}
                  onClick={() => toggleGeneration(gen)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Supertypes */}
          <FilterSection
            title="Card Type"
            defaultExpanded={selectedSupertypes.length > 0}
          >
            <div className="flex flex-wrap gap-2">
              {CARD_SUPERTYPES.map((supertype) => (
                <ChipFilter
                  key={supertype}
                  label={supertype}
                  active={selectedSupertypes.includes(supertype)}
                  onClick={() => toggleSupertype(supertype)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Special Filters */}
          <FilterSection title="Special" defaultExpanded={false}>
            <div className="space-y-2">
              <CheckboxItem
                label="Legendary Pokémon Only"
                checked={legendaryOnly}
                onChange={toggleLegendary}
              />
              <CheckboxItem
                label="Mythical Pokémon Only"
                checked={mythicalOnly}
                onChange={toggleMythical}
              />
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  )
}
