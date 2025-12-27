"use client";

import { TrackerCard, SlotConfig, SLOT_CONFIGS } from "@/lib/types/tracker";
import { CardSlot, EmptySlot, CardSlotSkeleton } from "./CardSlot";
import { getGridColsClass } from "@/lib/tracker/utils";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";

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
      {cards.map((card, index) => (
        <BlurFade
          key={card.variant_id}
          delay={index * 0.02}
          duration={0.3}
          direction="up"
          offset={4}
          blur="4px"
        >
          <CardSlot
            card={card}
            onToggle={() => onToggleCard(card.variant_id)}
            onOpenDetail={() => onOpenCardDetail(card.variant_id)}
            isHighlighted={highlightedVariantId === card.variant_id}
          />
        </BlurFade>
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <BlurFade
          key={`empty-${i}`}
          delay={(cards.length + i) * 0.02}
          duration={0.3}
          direction="up"
          offset={4}
          blur="4px"
        >
          <EmptySlot />
        </BlurFade>
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
