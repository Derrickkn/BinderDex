"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BottomSheet } from "@/components/ui/Modal";
import { TrackerCard, CollectionEntryUpdate } from "@/lib/types/tracker";
import { formatVariantType } from "@/lib/tracker/utils";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface CardDetailModalProps {
  card: TrackerCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CollectionEntryUpdate) => void;
  onUntrackPromo?: (promoId: string) => void;
  isSaving?: boolean;
  setTotal?: number;
}

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onSave,
  onUntrackPromo,
  isSaving = false,
  setTotal,
}: CardDetailModalProps) {
  const [isOwned, setIsOwned] = useState(false);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      setIsOwned(card.owned && card.quantity > 0);
    }
  }, [card]);

  const handleSave = () => {
    onSave({
      quantity: isOwned ? 1 : 0,
      condition: null,
      notes: null,
      acquired_date: null,
    });
    onClose();
  };

  if (!card) return null;

  const imageUrl = card.variant_image_url || card.image_large || card.image_small;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Card Details">
      <div className="space-y-5">
        {/* Card image and info */}
        <div className="flex gap-4">
          {/* Card image - larger size */}
          <div className="relative w-48 shrink-0 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-zinc-800">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={card.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-zinc-500 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Card info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg truncate">{card.name}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">
              #{card.number}{setTotal ? `/${setTotal}` : ""} • {card.rarity || "Unknown"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
                {formatVariantType(card.variant_type)}
              </span>
              {card.types?.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Promo source information */}
        {card.is_promo && card.promo_product_source && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-xs font-semibold uppercase tracking-wide mt-0.5">
                Promo Card
              </span>
            </div>
            <p className="text-sm text-zinc-300 mt-1">
              Source: {card.promo_product_source}
            </p>
          </div>
        )}

        {/* Owned toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <span className="text-sm font-medium text-zinc-300">Owned</span>
          <button
            onClick={() => setIsOwned(!isOwned)}
            className={cn(
              "flex h-8 w-14 items-center rounded-full p-1 transition-colors",
              isOwned ? "bg-green-600" : "bg-zinc-700"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
                isOwned ? "translate-x-6" : "translate-x-0"
              )}
            >
              {isOwned ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <X className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </div>
          </button>
        </div>

        {/* Untrack promo button (if applicable) */}
        {card.is_promo && onUntrackPromo && card.promo_id && (
          <div className="pt-1">
            <button
              onClick={() => {
                if (card.promo_id) {
                  onUntrackPromo(card.promo_id);
                  onClose();
                }
              }}
              className="w-full rounded-lg border border-amber-600/50 px-4 py-2.5 text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              Hide This Promo
            </button>
            <p className="text-xs text-zinc-500 mt-1.5 text-center">
              This promo will be hidden. Toggle promos off/on to restore.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              "bg-green-600 text-white hover:bg-green-700",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
