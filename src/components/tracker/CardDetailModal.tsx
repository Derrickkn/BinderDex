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
  isSaving?: boolean;
}

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: CardDetailModalProps) {
  const [notes, setNotes] = useState("");
  const [isOwned, setIsOwned] = useState(false);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      setNotes(card.notes || "");
      setIsOwned(card.owned && card.quantity > 0);
    }
  }, [card]);

  const handleSave = () => {
    onSave({
      quantity: isOwned ? 1 : 0,
      condition: null,
      notes: notes.trim() || null,
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
          {/* Card image */}
          <div className="relative w-28 shrink-0 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-zinc-800">
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
              #{card.number} • {card.rarity || "Unknown"}
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this card..."
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none"
          />
        </div>

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
