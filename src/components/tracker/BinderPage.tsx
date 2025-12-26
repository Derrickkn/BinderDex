"use client";

import { TrackerCard, SlotConfig, SLOT_CONFIGS } from "@/lib/types/tracker";
import { CardSlot, EmptySlot, CardSlotSkeleton } from "./CardSlot";
import { getGridColsClass } from "@/lib/tracker/utils";
import { cn } from "@/lib/utils";

interface BinderPageProps {
  cards: TrackerCard[];
  slotConfig: SlotConfig;
  onToggleCard: (variantId: string) => void;
  onOpenCardDetail: (variantId: string) => void;
  highlightedVariantId?: string | null;
}

export function BinderPage({
  cards,
  slotConfig,
  onToggleCard,
  onOpenCardDetail,
  highlightedVariantId,
}: BinderPageProps) {
  const slotsPerPage = SLOT_CONFIGS[slotConfig].total;
  const gridColsClass = getGridColsClass(slotConfig);

  // Fill remaining slots with empty placeholders
  const emptySlots = slotsPerPage - cards.length;

  return (
    <div
      className={cn(
        "grid gap-3 lg:gap-4",
        gridColsClass,
        // Ensure consistent aspect ratio for the page
        "aspect-auto"
      )}
    >
      {cards.map((card) => (
        <CardSlot
          key={card.variant_id}
          card={card}
          onToggle={() => onToggleCard(card.variant_id)}
          onOpenDetail={() => onOpenCardDetail(card.variant_id)}
          isHighlighted={highlightedVariantId === card.variant_id}
        />
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptySlot key={`empty-${i}`} />
      ))}
    </div>
  );
}

// Loading skeleton for BinderPage
export function BinderPageSkeleton({ slotConfig }: { slotConfig: SlotConfig }) {
  const slotsPerPage = SLOT_CONFIGS[slotConfig].total;
  const gridColsClass = getGridColsClass(slotConfig);

  return (
    <div className={cn("grid gap-3 lg:gap-4", gridColsClass)}>
      {Array.from({ length: slotsPerPage }).map((_, i) => (
        <CardSlotSkeleton key={i} />
      ))}
    </div>
  );
}
