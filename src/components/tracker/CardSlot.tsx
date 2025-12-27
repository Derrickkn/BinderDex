"use client";

import Image from "next/image";
import { useRef, useCallback, useState, useEffect } from "react";
import { TrackerCard } from "@/lib/types/tracker";
import { formatVariantType } from "@/lib/tracker/utils";
import { cn } from "@/lib/utils";

interface CardSlotProps {
  card: TrackerCard;
  onToggle: () => void;
  onOpenDetail: () => void;
  isHighlighted?: boolean;
}

export function CardSlot({
  card,
  onToggle,
  onOpenDetail,
  isHighlighted = false,
}: CardSlotProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const lastClickRef = useRef(0);
  const isContextMenuRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    isLongPressRef.current = false;
    isContextMenuRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onOpenDetail();
    }, 500);
  }, [onOpenDetail]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearTimer();
    // Only toggle on left-click (button 0), not right-click (button 2)
    // Also don't toggle if long press triggered
    if (!isLongPressRef.current && !isContextMenuRef.current && e.button === 0) {
      // Debounce: prevent accidental double-clicks within 150ms
      const now = Date.now();
      if (now - lastClickRef.current < 150) {
        return;
      }
      lastClickRef.current = now;
      onToggle();
    }
    // Reset context menu flag
    isContextMenuRef.current = false;
  }, [clearTimer, onToggle]);

  const handlePointerCancel = useCallback(() => {
    clearTimer();
    isLongPressRef.current = false;
    isContextMenuRef.current = false;
  }, [clearTimer]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isContextMenuRef.current = true;
    clearTimer();
    onOpenDetail();
  }, [clearTimer, onOpenDetail]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const imageUrl = card.variant_image_url || card.image_small || card.image_large;
  const isOwned = card.owned && card.quantity > 0;

  // Reset image loaded state when card changes
  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl, card.variant_id]);

  return (
    <div
      data-coach-card-slot
      data-owned={isOwned ? "true" : "false"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onContextMenu={handleContextMenu}
      className={cn(
        "group relative aspect-[2.5/3.5] overflow-hidden rounded-lg transition-all duration-200 cursor-pointer select-none touch-none",
        isOwned
          ? "ring-2 ring-green-500/30 hover:ring-green-500/50"
          : "border-2 border-dashed border-zinc-700 hover:border-zinc-600",
        isHighlighted && "ring-4 ring-amber-500/70 animate-pulse"
      )}
      title={`${card.name} - ${formatVariantType(card.variant_type)}`}
    >
      {/* Loading skeleton - shows while image is loading */}
      {imageUrl && !imageLoaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800" />
        </div>
      )}

      {/* Card image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          onLoad={handleImageLoad}
          className={cn(
            "object-cover transition-all duration-500",
            !isOwned && "grayscale opacity-40",
            // Smooth fade-in when image loads
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <span className="text-xs text-zinc-500 text-center px-1">
            {card.number}
          </span>
        </div>
      )}

      {/* Quantity badge */}
      {isOwned && card.quantity > 1 && (
        <div className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-bold text-white shadow-lg">
          {card.quantity}
        </div>
      )}

      {/* Variant indicator */}
      {card.variant_type !== "NORMAL" && (
        <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-300">
          {card.variant_type === "REVERSE_HOLO" ? "RH" : card.variant_type.charAt(0)}
        </div>
      )}

      {/* Pokemon Center exclusive indicator */}
      {card.is_pokemon_center_exclusive && (
        <div className="absolute bottom-1 left-1 rounded bg-amber-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          PC
        </div>
      )}

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity",
          "group-hover:opacity-100"
        )}
      >
        <span className="text-xs text-white text-center px-2">
          {isOwned ? "Click to remove" : "Click to add"}
        </span>
      </div>
    </div>
  );
}

// Empty slot placeholder
export function EmptySlot() {
  return (
    <div className="aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/30" />
  );
}

// Loading skeleton for CardSlot
export function CardSlotSkeleton() {
  return (
    <div className="aspect-[2.5/3.5] rounded-lg bg-zinc-800 animate-pulse" />
  );
}
