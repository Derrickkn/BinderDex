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
  // Initialize with a check if window is defined (SSR-safe)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true; // Default to desktop layout during SSR to prevent layout shift
  });

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}

/**
 * BinderView uses pagination instead of virtual scrolling for optimal performance:
 * - Only renders visible pages (max 32 slots on desktop, 16 on mobile)
 * - Pagination provides natural "virtualization" effect
 * - Maintains physical binder metaphor (swipe between pages)
 * - Image preloading for adjacent pages provides instant navigation
 *
 * Virtual scrolling is NOT needed here - pagination is more performant and UX-appropriate.
 */
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

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Pinch zoom state
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState(0);
  const [lastTap, setLastTap] = useState(0);

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

  // PERFORMANCE OPTIMIZATION: Preload images for adjacent pages
  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Calculate adjacent page indices
    const nextPageIndex = (currentPage + 1) * pagesPerView;
    const prevPageIndex = Math.max(0, (currentPage - 1) * pagesPerView);

    // Get cards for next and previous pages
    const nextPageCards = getCardsForPage(cards, nextPageIndex, slotConfig);
    const nextPageCards2 = isDesktop
      ? getCardsForPage(cards, nextPageIndex + 1, slotConfig)
      : [];
    const prevPageCards = getCardsForPage(cards, prevPageIndex, slotConfig);
    const prevPageCards2 = isDesktop
      ? getCardsForPage(cards, prevPageIndex + 1, slotConfig)
      : [];

    // Preload images for all adjacent pages
    const cardsToPreload = [
      ...nextPageCards,
      ...nextPageCards2,
      ...prevPageCards,
      ...prevPageCards2,
    ];

    cardsToPreload.forEach((card) => {
      if (card) {
        const imageUrl = card.variant_image_url || card.image_small || card.image_large;
        if (imageUrl) {
          // Use Image constructor to preload
          const img = new Image();
          img.src = imageUrl;
        }
      }
    });
  }, [cards, currentPage, pagesPerView, slotConfig, isDesktop]);

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

  // Helper to calculate distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch gesture handlers (swipe + pinch zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    } else if (e.touches.length === 1) {
      // Swipe start
      setTouchEnd(0);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      if (initialDistance > 0) {
        const newScale = (distance / initialDistance) * scale;
        // Constrain scale between 1x and 3x
        setScale(Math.min(Math.max(newScale, 1), 3));
      }
    } else if (e.touches.length === 1) {
      // Swipe
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      if (initialDistance > 0) {
        // End of pinch - commit the scale
        setInitialDistance(0);
      } else if (touchStart && touchEnd) {
        // End of swipe
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;

        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && canGoNext) {
          nextPage(totalViews);
        }
        if (isRightSwipe && canGoPrev) {
          prevPage();
        }
      }

      // Double tap to reset zoom
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        setScale(1);
      }
      setLastTap(currentTime);
    }
  };

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
          data-coach-navigation
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
          data-coach-navigation
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
        <div
          className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 shadow-xl overflow-auto touch-pan-x touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            maxHeight: '80vh',
          }}
        >
          <div className="text-xs text-zinc-600 mb-2 text-center font-medium">
            Page {firstPageIndex + 1} of {totalPages}
          </div>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: initialDistance > 0 ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <BinderPage
              cards={firstPageCards}
              slotConfig={slotConfig}
              onToggleCard={onToggleCard}
              onOpenCardDetail={onOpenCardDetail}
              highlightedVariantId={highlightedVariantId}
            />
          </div>
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
