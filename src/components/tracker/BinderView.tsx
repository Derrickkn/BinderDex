"use client";

import { useEffect, useCallback, useState } from "react";
import { TrackerCard, SlotConfig } from "@/lib/types/tracker";
import { BinderPage, BinderPageSkeleton } from "./BinderPage";
import { BinderNavigation } from "./BinderNavigation";
import { useTrackerStore } from "@/hooks/useTrackerStore";
import { getCardsForPage, calculateTotalPages } from "@/lib/tracker/utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BinderViewProps {
  cards: TrackerCard[];
  slotConfig: SlotConfig;
  onToggleCard: (variantId: string) => void;
  onOpenCardDetail: (variantId: string) => void;
  isLoading?: boolean;
}

// Hook to detect if we're on desktop
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}

export function BinderView({
  cards,
  slotConfig,
  onToggleCard,
  onOpenCardDetail,
  isLoading = false,
}: BinderViewProps) {
  const { currentPage, setCurrentPage, nextPage, prevPage, highlightedVariantId } =
    useTrackerStore();
  const isDesktop = useIsDesktop();

  const totalPages = calculateTotalPages(cards.length, slotConfig);

  // Desktop: show 2 pages at a time (spread), Mobile: single page
  const pagesPerView = isDesktop ? 2 : 1;
  const totalViews = Math.ceil(totalPages / pagesPerView);

  // Calculate which pages to show
  const firstPageIndex = currentPage * pagesPerView;
  const secondPageIndex = firstPageIndex + 1;

  const firstPageCards = getCardsForPage(cards, firstPageIndex, slotConfig);
  const secondPageCards = secondPageIndex < totalPages && isDesktop
    ? getCardsForPage(cards, secondPageIndex, slotConfig)
    : [];

  // Reset page if current view is out of bounds
  useEffect(() => {
    if (currentPage >= totalViews && totalViews > 0) {
      setCurrentPage(totalViews - 1);
    }
  }, [currentPage, totalViews, setCurrentPage]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "ArrowRight") {
        nextPage(totalViews);
      }
    },
    [prevPage, nextPage, totalViews]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalViews - 1;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="w-full max-w-7xl px-4">
          {/* Desktop loading skeleton */}
          <div className="hidden lg:flex items-stretch gap-0">
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-l-xl p-6">
              <BinderPageSkeleton slotConfig={slotConfig} />
            </div>
            <div className="w-3 bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800" />
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-r-xl p-6">
              <BinderPageSkeleton slotConfig={slotConfig} />
            </div>
          </div>
          {/* Mobile loading skeleton */}
          <div className="lg:hidden p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <BinderPageSkeleton slotConfig={slotConfig} />
          </div>
        </div>
        <BinderNavigation
          currentPage={0}
          totalPages={1}
          onPrevPage={() => {}}
          onNextPage={() => {}}
        />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-zinc-400 mb-2">No cards to display</p>
        <p className="text-sm text-zinc-500">
          Try adjusting your preferences to include more cards.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      {/* Desktop Binder View - Two page spread */}
      <div className="hidden lg:flex w-full max-w-7xl px-4 items-center gap-2">
        {/* Previous spread button */}
        <button
          onClick={prevPage}
          disabled={!canGoPrev}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
            canGoPrev
              ? "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              : "border-zinc-800 text-zinc-700 cursor-not-allowed"
          )}
          aria-label="Previous spread"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Open binder */}
        <div className="flex-1 flex items-stretch">
          {/* Left page */}
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800 border-r-0 rounded-l-xl p-5 shadow-2xl">
            <div className="text-xs text-zinc-600 mb-2 text-center font-medium">
              Page {firstPageIndex + 1}
            </div>
            <BinderPage
              cards={firstPageCards}
              slotConfig={slotConfig}
              onToggleCard={onToggleCard}
              onOpenCardDetail={onOpenCardDetail}
              highlightedVariantId={highlightedVariantId}
            />
          </div>

          {/* Binder spine */}
          <div className="w-3 relative flex-shrink-0 z-10">
            {/* Spine shadow on left side */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/20 to-transparent" />
            {/* Spine background */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800" />
            {/* Spine shadow on right side */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/20 to-transparent" />
          </div>

          {/* Right page */}
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800 border-l-0 rounded-r-xl p-5 shadow-2xl">
            {secondPageCards.length > 0 ? (
              <>
                <div className="text-xs text-zinc-600 mb-2 text-center font-medium">
                  Page {secondPageIndex + 1}
                </div>
                <BinderPage
                  cards={secondPageCards}
                  slotConfig={slotConfig}
                  onToggleCard={onToggleCard}
                  onOpenCardDetail={onOpenCardDetail}
                  highlightedVariantId={highlightedVariantId}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="text-zinc-600 text-sm mb-1">End of binder</div>
                  <div className="text-zinc-700 text-xs">
                    {totalPages} page{totalPages !== 1 ? "s" : ""} total
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next spread button */}
        <button
          onClick={() => nextPage(totalViews)}
          disabled={!canGoNext}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
            canGoNext
              ? "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              : "border-zinc-800 text-zinc-700 cursor-not-allowed"
          )}
          aria-label="Next spread"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop spread indicator */}
      <div className="hidden lg:flex items-center gap-2 mt-3 text-sm">
        <span className="text-zinc-300 font-medium">
          Pages {firstPageIndex + 1}-{Math.min(secondPageIndex + 1, totalPages)}
        </span>
        <span className="text-zinc-600">of</span>
        <span className="text-zinc-500">{totalPages}</span>
      </div>

      {/* Mobile Single Page View */}
      <div className="lg:hidden w-full px-3">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 shadow-xl">
          <div className="text-xs text-zinc-600 mb-2 text-center font-medium">
            Page {firstPageIndex + 1} of {totalPages}
          </div>
          <BinderPage
            cards={firstPageCards}
            slotConfig={slotConfig}
            onToggleCard={onToggleCard}
            onOpenCardDetail={onOpenCardDetail}
            highlightedVariantId={highlightedVariantId}
          />
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="lg:hidden w-full mt-3">
        <BinderNavigation
          currentPage={currentPage}
          totalPages={totalViews}
          onPrevPage={prevPage}
          onNextPage={() => nextPage(totalViews)}
        />
      </div>
    </div>
  );
}
