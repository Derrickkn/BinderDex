/**
 * Browse Cards Page
 *
 * Displays all unique cards (NO variants) with filtering, sorting, and search.
 * Phase 1A: ✅ Basic grid display with loading/error states
 * Phase 1B: ✅ Virtual scrolling with react-window
 * Phase 1C: ✅ Shared filter system with search, multi-select, and toggles
 * Phase 1D: ✅ URL sync, FilterBar, Sort, View mode
 * Phase 1E: ✅ Card detail modal with keyboard navigation
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"
import { useBrowseCards } from "@/hooks/browse/useBrowseCards"
import { useAvailableSets } from "@/hooks/browse/useAvailableSets"
import { useCardFilters } from "@/hooks/browse/useCardFilters"
import { useFilterStore } from "@/stores/filterStore"
import { CardGrid } from "@/components/browse/CardGrid"
import { CardListView } from "@/components/browse/CardListView"
import { FilterPanel } from "@/components/browse/FilterPanel"
import { FilterBar } from "@/components/browse/FilterBar"
import { SortDropdown } from "@/components/browse/SortDropdown"
import { ViewModeToggle } from "@/components/browse/ViewModeToggle"
import { BrowseCardModal } from "@/components/browse/BrowseCardModal"
import { BrowseHeader } from "@/components/browse/BrowseHeader"
import { BlurFade } from "@/components/magicui/blur-fade"
import { cn } from "@/lib/utils"

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: cards, isLoading, isError, error, refetch } = useBrowseCards()
  const { data: sets, isLoading: setsLoading } = useAvailableSets()

  // Filter store
  const { viewMode, fromURLParams, toURLParams } = useFilterStore()

  // Filter state
  const { filteredCards, totalCount, filteredCount, hasActiveFilters } =
    useCardFilters(cards || [])

  // Modal state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Find selected card and navigation info
  const selectedCardIndex = filteredCards.findIndex(
    (card) => card.id === selectedCardId
  )
  const selectedCard =
    selectedCardIndex >= 0 ? filteredCards[selectedCardIndex] : null
  const canNavigatePrev = selectedCardIndex > 0
  const canNavigateNext = selectedCardIndex < filteredCards.length - 1

  // Modal handlers
  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId)
  }

  const handleCloseModal = () => {
    setSelectedCardId(null)
  }

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && canNavigatePrev) {
      setSelectedCardId(filteredCards[selectedCardIndex - 1].id)
    } else if (direction === "next" && canNavigateNext) {
      setSelectedCardId(filteredCards[selectedCardIndex + 1].id)
    }
  }

  // Read URL params on mount
  useEffect(() => {
    if (searchParams) {
      fromURLParams(searchParams)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Subscribe to filter changes and update URL
  useEffect(() => {
    const unsubscribe = useFilterStore.subscribe(() => {
      const params = toURLParams()
      const newURL = params.toString()
        ? `/browse?${params.toString()}`
        : "/browse"

      // Shallow push (no page reload)
      router.replace(newURL, { scroll: false })
    })

    return unsubscribe
  }, [router, toURLParams])

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            Failed to Load Cards
          </h2>
          <p className="text-sm text-zinc-400 mb-8">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Loading state (handled by loading.tsx, but keep as fallback)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 w-48 bg-zinc-800 rounded-lg animate-pulse mb-8" />
          <div className="grid gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2.5/3.5] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sticky Header */}
      <BrowseHeader
        totalCards={totalCount}
        filteredCount={filteredCount}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          {!setsLoading && sets && (
            <FilterPanel sets={sets} className="sticky top-[57px] h-[calc(100vh-57px)]" />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-6">
            {/* Toolbar: Mobile Filter + Sort & View controls */}
            <BlurFade delay={0.1} duration={0.4}>
              <div className="mb-4 relative z-30">
                <div className="flex items-center justify-between gap-4 mb-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className={cn(
                      "lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-zinc-800 hover:bg-zinc-700 transition-colors",
                      "text-sm font-medium"
                    )}
                    aria-label="Open filters"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>

                  <div className="flex items-center gap-3 ml-auto">
                    <SortDropdown />
                    <ViewModeToggle />
                  </div>
                </div>

                {/* Active filter chips */}
                {sets && (
                  <FilterBar
                    sets={sets}
                    filteredCount={filteredCount}
                    totalCount={totalCount}
                    hasActiveFilters={hasActiveFilters}
                  />
                )}
              </div>
            </BlurFade>

            {/* Card Display - Grid or List based on viewMode */}
            <BlurFade delay={0.2} duration={0.4}>
              <div className="relative z-10">
                {viewMode === "grid" ? (
                <CardGrid
                  cards={filteredCards}
                  onCardClick={handleCardClick}
                  className="mb-8"
                />
              ) : (
                <CardListView
                  cards={filteredCards}
                  onCardClick={handleCardClick}
                  className="mb-8"
                />
              )}
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {!setsLoading && sets && (
        <FilterPanel
          sets={sets}
          isMobile
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {/* Card Detail Modal */}
      <BrowseCardModal
        card={selectedCard}
        isOpen={!!selectedCardId}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
      />
    </div>
  )
}
