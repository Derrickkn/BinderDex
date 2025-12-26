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
} from "@/components/tracker";
import { calculateProgress } from "@/lib/tracker/utils";
import { CollectionEntryUpdate } from "@/lib/types/tracker";

export default function TrackerSetPage() {
  const params = useParams();
  const setId = params.setId as string;

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
  const { updatePreferences, isUpdating: isUpdatingPreferences } = useTrackerPreferences(setId);

  // Fetch cards with variants
  const { data: cards, isLoading: isLoadingCards } = useSetVariants(setId, preferences);

  // Mutations - pass preferences so they use the same query key as useSetVariants
  const toggleOwned = useToggleOwned(setId, preferences);
  const updateCollection = useUpdateCollectionEntry(setId, preferences);

  // Bulk actions
  const bulkActions = useBulkActions(setId, preferences);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

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
  const handleSlotConfigChange = (config: typeof preferences.slotConfig) => {
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

  // Loading state
  if (isLoadingSet || !set) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <TrackerHeaderSkeleton />
        <main className="container mx-auto">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2.5/3.5] rounded-lg bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          </div>
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
        slotConfig={preferences.slotConfig}
        onSlotConfigChange={handleSlotConfigChange}
        includePromos={preferences.includePromos}
        includeReverseHolos={preferences.includeReverseHolos}
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
      <main className="container mx-auto">
        <BinderView
          cards={cards || []}
          slotConfig={preferences.slotConfig}
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
            slotConfig={preferences.slotConfig}
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
      />
    </div>
  );
}
