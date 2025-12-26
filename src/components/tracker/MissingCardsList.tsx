"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { TrackerCard, SlotConfig } from "@/lib/types/tracker";
import { formatVariantType, getMissingCards, getViewForCard } from "@/lib/tracker/utils";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportButtons } from "./ExportButtons";
import { useTrackerStore } from "@/hooks/useTrackerStore";

type SortField = "number" | "rarity" | "name";
type SortDirection = "asc" | "desc";

// Rarity order for sorting (most common to rarest)
const RARITY_ORDER: Record<string, number> = {
  "Common": 1,
  "Uncommon": 2,
  "Rare": 3,
  "Rare Holo": 4,
  "Rare Ultra": 5,
  "Rare Holo EX": 6,
  "Rare Holo GX": 7,
  "Rare Holo V": 8,
  "Rare Holo VMAX": 9,
  "Rare Holo VSTAR": 10,
  "Rare Secret": 11,
  "Rare Rainbow": 12,
  "Illustration Rare": 13,
  "Special Illustration Rare": 14,
  "Hyper Rare": 15,
};

interface MissingCardsListProps {
  cards: TrackerCard[];
  setId: string;
  setName: string;
  onCardClick?: (variantId: string) => void;
  slotConfig?: SlotConfig;
  totalCardsInSet?: number;
}

export function MissingCardsList({
  cards,
  setId,
  setName,
  onCardClick,
  slotConfig = "NINE",
  totalCardsInSet,
}: MissingCardsListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const { setCurrentPage, highlightCard, clearHighlight } = useTrackerStore();

  const missingCards = getMissingCards(cards);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort missing cards based on selected option
  const sortedMissingCards = useMemo(() => {
    const sorted = [...missingCards];

    let result: TrackerCard[];

    switch (sortField) {
      case "number":
        result = sorted.sort((a, b) => {
          const numA = parseInt(a.number, 10);
          const numB = parseInt(b.number, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.number.localeCompare(b.number, undefined, { numeric: true });
        });
        break;
      case "rarity":
        result = sorted.sort((a, b) => {
          const orderA = a.rarity ? (RARITY_ORDER[a.rarity] ?? 50) : 100;
          const orderB = b.rarity ? (RARITY_ORDER[b.rarity] ?? 50) : 100;
          if (orderA !== orderB) return orderA - orderB;
          // Secondary sort by number
          const numA = parseInt(a.number, 10);
          const numB = parseInt(b.number, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.number.localeCompare(b.number, undefined, { numeric: true });
        });
        break;
      case "name":
        result = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = sorted;
    }

    // Reverse if descending
    return sortDirection === 'desc' ? result.reverse() : result;
  }, [missingCards, sortField, sortDirection]);

  // Handle card left-click - navigate to page and highlight (no modal)
  const handleCardNavigate = (card: TrackerCard) => {
    // Determine if desktop (2 pages per view) or mobile (1 page)
    const isDesktop = window.innerWidth >= 1024;
    const pagesPerView = isDesktop ? 2 : 1;

    // Get the view index for this card
    const viewIndex = getViewForCard(cards, card.variant_id, slotConfig, pagesPerView);

    // Navigate to that view
    setCurrentPage(viewIndex);

    // Highlight the card slot
    highlightCard(card.variant_id);

    // Clear highlight after animation
    setTimeout(() => {
      clearHighlight();
    }, 2000);
  };

  // Handle card right-click - open card details modal
  const handleCardDetail = (card: TrackerCard, e: React.MouseEvent) => {
    e.preventDefault();
    onCardClick?.(card.variant_id);
  };

  // Handle sort option click - toggle direction if same field is clicked
  const handleSortClick = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Switch to new field with ascending as default
      setSortField(field);
      setSortDirection("asc");
    }
    setSortDropdownOpen(false);
  };

  // Sort option display configuration
  const sortOptions: Array<{ value: SortField; label: string }> = [
    { value: "number", label: "Number" },
    { value: "rarity", label: "Rarity" },
    { value: "name", label: "Name" },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortField)?.label || "Number";
  const currentSortIcon = sortDirection === "asc"
    ? <ArrowUp className="h-3 w-3" />
    : <ArrowDown className="h-3 w-3" />;

  if (missingCards.length === 0) {
    return (
      <div className="border-t border-zinc-800 bg-zinc-900/50 px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-green-400">
          <span className="text-sm font-medium">
            Set complete! You have all cards.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div data-coach-missing-cards className="border-t border-zinc-800 bg-zinc-900/50">
      {/* Consolidated header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Missing Cards count */}
        <span className="text-sm font-medium text-zinc-300 whitespace-nowrap">
          Missing Cards ({missingCards.length})
        </span>

        {/* Sort dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <span className="hidden sm:inline">Sort:</span>
            <span>{currentSortLabel}</span>
            {currentSortIcon}
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform ml-0.5",
              sortDropdownOpen && "rotate-180"
            )} />
          </button>

          {sortDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortClick(option.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2",
                    sortField === option.value
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                  {sortField === option.value && (
                    sortDirection === "asc"
                      ? <ArrowUp className="h-3 w-3" />
                      : <ArrowDown className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export buttons */}
        {isExpanded && (
          <div className="hidden sm:block">
            <ExportButtons cards={cards} setId={setId} setName={setName} totalCardsInSet={totalCardsInSet} />
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center h-7 w-7 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
          aria-label={isExpanded ? "Collapse missing cards" : "Expand missing cards"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded content - with animation */}
      <div
        className={cn(
          "border-t border-zinc-800/50 overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Mobile export buttons */}
        <div className="sm:hidden px-4 py-2 border-b border-zinc-800/50">
          <ExportButtons cards={cards} setId={setId} setName={setName} totalCardsInSet={totalCardsInSet} />
        </div>

        {/* Card grid - custom scrollbar styling */}
        <div className="max-h-64 overflow-y-auto px-4 py-3 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {sortedMissingCards.map((card) => (
              <MissingCardItem
                key={card.variant_id}
                card={card}
                onClick={() => handleCardNavigate(card)}
                onRightClick={(e) => handleCardDetail(card, e)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MissingCardItemProps {
  card: TrackerCard;
  onClick?: () => void;
  onRightClick?: (e: React.MouseEvent) => void;
}

function MissingCardItem({ card, onClick, onRightClick }: MissingCardItemProps) {
  const imageUrl = card.variant_image_url || card.image_small;

  return (
    <button
      onClick={onClick}
      onContextMenu={onRightClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-2",
        "hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors text-left",
        "group"
      )}
      title="Click to find in binder • Right-click for details"
    >
      {/* Thumbnail */}
      <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            sizes="32px"
            className="object-cover grayscale opacity-60 group-hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] text-zinc-600">{card.number}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-300 truncate">{card.name}</p>
        <p className="text-[10px] text-zinc-500 truncate">
          #{card.number} • {card.rarity}
          {card.variant_type !== "NORMAL" && (
            <span> • {formatVariantType(card.variant_type)}</span>
          )}
        </p>
      </div>
    </button>
  );
}

// Compact version showing just count
export function MissingCardsCount({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="text-xs text-green-400">Complete!</span>
    );
  }

  return (
    <span className="text-xs text-zinc-500">
      {count} missing
    </span>
  );
}
