"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSetById } from "@/lib/tracker";
import { useSetVariants, useTrackerPreferences, useToggleOwned, useUpdateCollectionEntry, useUntrackPromo, useHiddenPromos, useRestorePromo, useBulkActions, type BulkActionResult } from "@/hooks/tracker";
import { useTrackerStore } from "@/hooks/useTrackerStore";
import {
  TrackerHeader,
  TrackerHeaderSkeleton,
  TrackerToolbar,
  BinderView,
  CardDetailModal,
  MissingCardsList,
  CoachMarks,
  HelpOverlay,
  type CoachMarkStep,
} from "@/components/tracker";
import { calculateProgress } from "@/lib/tracker/utils";
import { CollectionEntryUpdate } from "@/lib/types/tracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TrackerErrorFallback } from "@/components/tracker/TrackerErrorFallback";

export default function TrackerSetPage() {
  const params = useParams();
  const setId = params.setId as string;

  // Coach marks restart function
  const [restartCoachMarks, setRestartCoachMarks] = useState<(() => void) | null>(null);

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // UI state
  const { preferences, selectedVariantId, isModalOpen, openModal, closeModal } = useTrackerStore();

  // Fetch set data
  const { data: set, isLoading: isLoadingSet, isError: isSetError, error: setError, refetch: refetchSet } = useQuery({
    queryKey: ["set", setId],
    queryFn: async () => {
      const result = await getSetById(setId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!setId,
  });

  // Fetch and sync preferences
  const { data: serverPreferences, isLoading: isLoadingPreferences, isError: isPreferencesError, error: preferencesError, updatePreferences, isUpdating: isUpdatingPreferences } = useTrackerPreferences(setId);

  // Use server preferences if available, fall back to store preferences
  // This prevents layout shift when serverPreferences loads after initial render
  const currentPreferences = serverPreferences || preferences;

  // Fetch cards with variants
  const { data: cards, isLoading: isLoadingCards, isError: isCardsError, error: cardsError, refetch: refetchCards } = useSetVariants(setId, currentPreferences);

  // Mutations - pass currentPreferences so they use the same query key as useSetVariants
  const toggleOwned = useToggleOwned(setId, currentPreferences);
  const updateCollection = useUpdateCollectionEntry(setId, currentPreferences);
  const untrackPromoMutation = useUntrackPromo(setId, currentPreferences);

  // Hidden promos management
  const { data: hiddenPromos } = useHiddenPromos(setId);
  const restorePromoMutation = useRestorePromo(setId, currentPreferences);

  // Bulk actions
  const bulkActions = useBulkActions(setId, currentPreferences);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Coach marks configuration - dynamic based on device type
  // Ordered for logical top-to-bottom flow: cards → toolbar → navigation → bottom section
  const coachMarkSteps: CoachMarkStep[] = useMemo(() => [
    {
      target: "[data-coach-card-slot]",
      title: "Track Your Collection",
      description: isTouchDevice
        ? "Tap any card to mark it as owned or missing."
        : "Left-click any card to mark it as owned or missing.",
      position: "bottom",
    },
    {
      target: "[data-coach-card-slot]",
      title: "Card Details",
      description: isTouchDevice
        ? "Touch and hold any card to view detailed information and manage your collection."
        : "Right-click any card to view detailed information and manage your collection.",
      position: "bottom",
    },
    {
      target: "[data-coach-quick-fill]",
      title: "Quick Fill",
      description: isTouchDevice
        ? "Tap here to quickly mark entire rarities as owned."
        : "Click here to quickly mark entire rarities as owned.",
      position: "bottom",
    },
    {
      target: "[data-coach-binder-settings]",
      title: "Customize Your Binder",
      description: isTouchDevice
        ? "Tap to change binder layout (3×3, 3×4, 4×4) and toggle Reverse Holos or Promos to match your physical collection."
        : "Click to change binder layout (3×3, 3×4, 4×4) and toggle Reverse Holos or Promos to match your physical collection.",
      position: "bottom",
    },
    {
      target: "[data-coach-navigation]",
      title: "Navigate Your Binder",
      description: isTouchDevice
        ? "Browse pages with these arrows or swipe left and right."
        : "Browse pages with these arrows or use your keyboard's ← → keys for quick navigation.",
      position: "top",
    },
    {
      target: "[data-coach-missing-cards]",
      title: "Find Missing Cards",
      description: isTouchDevice
        ? "Tap any missing card to jump directly to its slot in the binder."
        : "Click any missing card to jump directly to its slot in the binder.",
      position: "top",
    },
    {
      target: "[data-coach-export]",
      title: "Export Options",
      description: "Export your missing cards list to PDF or Excel.",
      position: "top",
    },
  ], [isTouchDevice]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!cards) return { totalCards: 0, ownedCards: 0, percentage: 0 };
    return calculateProgress(cards);
  }, [cards]);

  // Get selected card for modal
  const selectedCard = useMemo(() => {
    if (!selectedVariantId || !cards) return null;
    return cards.find((c) => c.variant_id === selectedVariantId) || null;
  }, [selectedVariantId, cards]);

  // Handle preference changes (updatePreferences handles both local store + server save)
  const handleSlotConfigChange = (config: typeof currentPreferences.slotConfig) => {
    updatePreferences({ slotConfig: config });
  };

  const handleIncludePromosChange = (include: boolean) => {
    updatePreferences({ includePromos: include });
  };

  const handleIncludeReverseHolosChange = (include: boolean) => {
    updatePreferences({ includeReverseHolos: include });
  };

  const handleIncludePokeballChange = (include: boolean) => {
    updatePreferences({ includePokeball: include });
  };

  const handleIncludeMasterballChange = (include: boolean) => {
    updatePreferences({ includeMasterball: include });
  };

  // Handle card toggle
  const handleToggleCard = (variantId: string) => {
    toggleOwned.mutate(variantId);
  };

  // Handle card detail save
  const handleSaveCardDetail = (data: CollectionEntryUpdate) => {
    if (selectedVariantId) {
      updateCollection.mutate({ variantId: selectedVariantId, data });
    }
  };

  // Handle promo untrack
  const handleUntrackPromo = (promoId: string) => {
    untrackPromoMutation.mutate(promoId);
  };

  // Handle promo restore
  const handleRestorePromo = (promoId: string) => {
    restorePromoMutation.mutate(promoId);
  };

  // Bulk action handlers - return result for feedback
  const handleMarkByRarity = async (rarity: string): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.markByRarity(rarity);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleMarkReverseHolosByRarity = async (rarity: string): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.markReverseHolosByRarity(rarity);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleMarkPokeballsByRarity = async (rarity: string): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.markPokeballsByRarity(rarity);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleMarkMasterballsByRarity = async (rarity: string): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.markMasterballsByRarity(rarity);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleMarkAll = async (): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.markAll();
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleClearAll = async (): Promise<BulkActionResult> => {
    setIsBulkLoading(true);
    try {
      return await bulkActions.clearAll();
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Error state - show retry UI if any query fails
  if (isSetError || isPreferencesError || isCardsError) {
    const errorMessage = (setError || preferencesError || cardsError)?.message || 'Failed to load tracker data';
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Failed to Load</h2>
          <p className="text-zinc-400 mb-6">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/tracker'}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Back to Sets
            </button>
            <button
              onClick={() => {
                if (isSetError) refetchSet();
                if (isCardsError) refetchCards();
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - wait for both set and preferences to load
  if (isLoadingSet || !set || isLoadingPreferences || !serverPreferences) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <TrackerHeaderSkeleton />
        <main className="container mx-auto">
          {/* Only show skeleton if we have server preferences (prevents layout shift) */}
          {serverPreferences ? (
            <BinderView
              cards={[]}
              slotConfig={serverPreferences.slotConfig}
              onToggleCard={() => {}}
              onOpenCardDetail={() => {}}
              isLoading={true}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-700 border-r-transparent"></div>
                <p className="mt-4 text-sm text-zinc-500">Loading tracker...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <TrackerErrorFallback
          error={new Error("Failed to load tracker")}
          resetErrorBoundary={() => window.location.reload()}
        />
      }
    >
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <TrackerHeader
          set={set}
          progress={progress}
        />

        {/* Toolbar with Quick Fill, Slot Config, Toggles */}
        <TrackerToolbar
        slotConfig={currentPreferences.slotConfig}
        onSlotConfigChange={handleSlotConfigChange}
        includePromos={currentPreferences.includePromos}
        includeReverseHolos={currentPreferences.includeReverseHolos}
        includePokeball={currentPreferences.includePokeball}
        includeMasterball={currentPreferences.includeMasterball}
        onIncludePromosChange={handleIncludePromosChange}
        onIncludeReverseHolosChange={handleIncludeReverseHolosChange}
        onIncludePokeballChange={handleIncludePokeballChange}
        onIncludeMasterballChange={handleIncludeMasterballChange}
        hasPokeballVariants={set?.has_pokeball_variants ?? false}
        hasMasterballVariants={set?.has_masterball_variants ?? false}
        rarities={bulkActions.rarities}
        reverseHoloRarities={bulkActions.reverseHoloRarities}
        pokeballRarities={bulkActions.pokeballRarities}
        masterballRarities={bulkActions.masterballRarities}
        onMarkByRarity={handleMarkByRarity}
        onMarkReverseHolosByRarity={handleMarkReverseHolosByRarity}
        onMarkPokeballsByRarity={handleMarkPokeballsByRarity}
        onMarkMasterballsByRarity={handleMarkMasterballsByRarity}
        onMarkAll={handleMarkAll}
        onClearAll={handleClearAll}
        isLoading={isBulkLoading}
        isUpdating={isUpdatingPreferences}
      />

      {/* Main binder view */}
      <main className="container mx-auto pb-8">
        <BinderView
          cards={cards || []}
          slotConfig={currentPreferences.slotConfig}
          onToggleCard={handleToggleCard}
          onOpenCardDetail={openModal}
          isLoading={isLoadingCards}
        />

        {/* Missing cards list with hidden promos subsection */}
        {cards && cards.length > 0 && set && (
          <MissingCardsList
            cards={cards}
            setId={setId}
            setName={set.name}
            onCardClick={openModal}
            slotConfig={currentPreferences.slotConfig}
            totalCardsInSet={set.printed_total}
            hiddenPromos={hiddenPromos}
            onRestorePromo={handleRestorePromo}
          />
        )}
      </main>

      {/* Card detail modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveCardDetail}
        onUntrackPromo={handleUntrackPromo}
        isSaving={updateCollection.isPending}
        setTotal={set?.printed_total}
      />

      {/* Coach marks tutorial */}
      <CoachMarks
        steps={coachMarkSteps}
        storageKey="hasSeenTrackerTutorial"
        onRestart={(restartFn) => setRestartCoachMarks(() => restartFn)}
      />

      {/* Help overlay - now triggers coach marks restart */}
      <HelpOverlay
        onRestartTutorial={() => {
          if (restartCoachMarks) {
            restartCoachMarks();
          }
        }}
      />
      </div>
    </ErrorBoundary>
  );
}
