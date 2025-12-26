"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSetById } from "@/lib/tracker/actions";
import { useSetVariants, useTrackerPreferences, useToggleOwned, useUpdateCollectionEntry, useBulkActions, type BulkActionResult } from "@/hooks/tracker";
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

export default function TrackerSetPage() {
  const params = useParams();
  const setId = params.setId as string;

  // Coach marks restart function
  const [restartCoachMarks, setRestartCoachMarks] = useState<(() => void) | null>(null);

  // UI state
  const { preferences, selectedVariantId, isModalOpen, openModal, closeModal } = useTrackerStore();

  // Fetch set data
  const { data: set, isLoading: isLoadingSet } = useQuery({
    queryKey: ["set", setId],
    queryFn: async () => {
      const result = await getSetById(setId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!setId,
  });

  // Fetch and sync preferences
  const { data: serverPreferences, isLoading: isLoadingPreferences, updatePreferences, isUpdating: isUpdatingPreferences } = useTrackerPreferences(setId);

  // Use server preferences if available, fall back to store preferences
  // This prevents layout shift when serverPreferences loads after initial render
  const currentPreferences = serverPreferences || preferences;

  // Fetch cards with variants
  const { data: cards, isLoading: isLoadingCards } = useSetVariants(setId, currentPreferences);

  // Mutations - pass currentPreferences so they use the same query key as useSetVariants
  const toggleOwned = useToggleOwned(setId, currentPreferences);
  const updateCollection = useUpdateCollectionEntry(setId, currentPreferences);

  // Bulk actions
  const bulkActions = useBulkActions(setId, currentPreferences);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Coach marks configuration
  const coachMarkSteps: CoachMarkStep[] = [
    {
      target: "[data-coach-card-slot]",
      title: "Track Your Collection",
      description: "Left-click any card to mark it as owned or missing.",
      position: "bottom",
    },
    {
      target: "[data-coach-card-slot]",
      title: "Card Details",
      description: "Right-click any card to view detailed information and manage your collection.",
      position: "bottom",
    },
    {
      target: "[data-coach-navigation]",
      title: "Navigate Your Binder",
      description: "Browse pages with these arrows or use your keyboard's ← → keys for quick navigation.",
      position: "top",
    },
    {
      target: "[data-coach-quick-fill-dropdown]",
      title: "Quick Fill",
      description: "Quickly mark entire rarities as owned with these buttons.",
      position: "left",
    },
    {
      target: "[data-coach-missing-cards]",
      title: "Find Missing Cards",
      description: "Click any missing card to jump directly to its slot in the binder.",
      position: "top",
    },
    {
      target: "[data-coach-export]",
      title: "Export Options",
      description: "Export your missing cards list to PDF or Excel.",
      position: "top",
    },
  ];

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
        onIncludePromosChange={handleIncludePromosChange}
        onIncludeReverseHolosChange={handleIncludeReverseHolosChange}
        rarities={bulkActions.rarities}
        reverseHoloRarities={bulkActions.reverseHoloRarities}
        onMarkByRarity={handleMarkByRarity}
        onMarkReverseHolosByRarity={handleMarkReverseHolosByRarity}
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

        {/* Missing cards list */}
        {cards && cards.length > 0 && set && (
          <MissingCardsList
            cards={cards}
            setId={setId}
            setName={set.name}
            onCardClick={openModal}
            slotConfig={currentPreferences.slotConfig}
            totalCardsInSet={set.printed_total}
          />
        )}
      </main>

      {/* Card detail modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveCardDetail}
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
  );
}
