"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Layers,
  CheckCircle2,
  Circle,
  Loader2,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SlotConfig } from "@/lib/types/tracker";

type BulkActionResult = { count: number; error: string | null };

interface TrackerToolbarProps {
  // Slot config
  slotConfig: SlotConfig;
  onSlotConfigChange: (config: SlotConfig) => void;
  // Toggles
  includePromos: boolean;
  includeReverseHolos: boolean;
  onIncludePromosChange: (include: boolean) => void;
  onIncludeReverseHolosChange: (include: boolean) => void;
  // Quick Fill
  rarities: string[];
  reverseHoloRarities: string[];
  onMarkByRarity: (rarity: string) => Promise<BulkActionResult>;
  onMarkReverseHolosByRarity: (rarity: string) => Promise<BulkActionResult>;
  onMarkAll: () => Promise<BulkActionResult>;
  onClearAll: () => Promise<BulkActionResult>;
  // Loading states
  isLoading?: boolean;
  isUpdating?: boolean;
}

// Slot config options
const SLOT_OPTIONS: { value: SlotConfig; label: string; cols: number; rows: number }[] = [
  { value: "NINE", label: "3×3", cols: 3, rows: 3 },
  { value: "TWELVE", label: "3×4", cols: 3, rows: 4 },
  { value: "SIXTEEN", label: "4×4", cols: 4, rows: 4 },
];

// Rarity display names
const RARITY_DISPLAY: Record<string, string> = {
  "common": "Commons",
  "uncommon": "Uncommons",
  "rare": "Rares",
  "rare holo": "Holos",
  "double rare": "Double Rares",
  "illustration rare": "Illustration Rares",
  "special illustration rare": "Special Illustration Rares",
  "hyper rare": "Hyper Rares",
  "ultra rare": "Ultra Rares",
  "ace spec rare": "Ace Specs",
  "shiny rare": "Shiny Rares",
  "shiny ultra rare": "Shiny Ultra Rares",
};

function getRarityDisplay(rarity: string): string {
  return RARITY_DISPLAY[rarity.toLowerCase()] || rarity;
}

// Rarity sort order
const RARITY_ORDER = [
  "common", "uncommon", "rare", "rare holo", "double rare", "ultra rare",
  "illustration rare", "special illustration rare", "hyper rare",
  "ace spec rare", "shiny rare", "shiny ultra rare",
];

function sortRarities(rarities: string[]): string[] {
  return [...rarities].sort((a, b) => {
    const aIndex = RARITY_ORDER.indexOf(a.toLowerCase());
    const bIndex = RARITY_ORDER.indexOf(b.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export function TrackerToolbar({
  slotConfig,
  onSlotConfigChange,
  includePromos,
  includeReverseHolos,
  onIncludePromosChange,
  onIncludeReverseHolosChange,
  rarities,
  reverseHoloRarities,
  onMarkByRarity,
  onMarkReverseHolosByRarity,
  onMarkAll,
  onClearAll,
  isLoading = false,
  isUpdating = false,
}: TrackerToolbarProps) {
  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<"mark-all" | "clear-all" | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedRarities = sortRarities(rarities);

  // Handle opening dropdown with immediate position calculation
  const handleToggleDropdown = () => {
    if (!quickFillOpen && buttonRef.current) {
      // Calculate position BEFORE opening to prevent flash
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setQuickFillOpen(!quickFillOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setQuickFillOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const duration = notification.type === "error" ? 5000 : 3000;
      const timer = setTimeout(() => setNotification(null), duration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAction = async (actionId: string, action: () => Promise<BulkActionResult>, description: string) => {
    if (isLoading) return;
    setActiveAction(actionId);
    setNotification(null);
    try {
      const result = await action();
      if (result.error) {
        setNotification({ message: result.error, type: "error" });
      } else if (result.count > 0) {
        setNotification({ message: `Marked ${result.count} ${description} as owned`, type: "success" });
      } else {
        setNotification({ message: `All ${description} already owned`, type: "info" });
      }
    } finally {
      setActiveAction(null);
    }
  };

  const handleClearAction = async (actionId: string, action: () => Promise<BulkActionResult>) => {
    if (isLoading) return;
    setActiveAction(actionId);
    setNotification(null);
    try {
      const result = await action();
      if (result.error) {
        setNotification({ message: result.error, type: "error" });
      } else if (result.count > 0) {
        setNotification({ message: `Cleared ${result.count} cards`, type: "info" });
      } else {
        setNotification({ message: "No cards to clear", type: "info" });
      }
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <>
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-1.5">
            {/* Quick Fill Button */}
            <button
              data-coach-quick-fill
              ref={buttonRef}
              onClick={handleToggleDropdown}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
                "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white",
                "border border-zinc-700 transition-colors",
                quickFillOpen && "bg-zinc-700 text-white"
              )}
            >
              <span>Quick Fill</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", quickFillOpen && "rotate-180")} />
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-zinc-700/50 mx-1.5" />

            {/* Slot Config Segmented Buttons */}
            <div className="flex items-center rounded-md border border-zinc-700 overflow-hidden">
              {SLOT_OPTIONS.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => onSlotConfigChange(option.value)}
                  disabled={isUpdating}
                  title={`${option.label} grid layout`}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors",
                    idx > 0 && "border-l border-zinc-700",
                    slotConfig === option.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800/50 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800",
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <GridIcon cols={option.cols} rows={option.rows} active={slotConfig === option.value} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="h-5 w-px bg-zinc-700/50 mx-1.5" />

            {/* Toggle Pills */}
            <div className="flex items-center gap-1.5">
              <TogglePill
                label="Reverse Holos"
                shortLabel="RH"
                active={includeReverseHolos}
                onClick={() => onIncludeReverseHolosChange(!includeReverseHolos)}
                disabled={isUpdating}
              />
              <TogglePill
                label="Promos"
                active={includePromos}
                onClick={() => onIncludePromosChange(!includePromos)}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Fill Dropdown - Fixed position overlay */}
      {quickFillOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-72 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            {/* Notification */}
            {notification && (
              <div
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
                  notification.type === "success" && "bg-green-900/30 text-green-400 border border-green-800/50",
                  notification.type === "info" && "bg-zinc-800 text-zinc-300 border border-zinc-700",
                  notification.type === "error" && "bg-red-900/30 text-red-400 border border-red-800/50"
                )}
              >
                {notification.type === "error" ? (
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span className="truncate">{notification.message}</span>
              </div>
            )}

            {/* By Rarity */}
            {sortedRarities.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wide">By Rarity</div>
                <div className="flex flex-wrap gap-1.5">
                  {sortedRarities.map((rarity) => (
                    <QuickFillButton
                      key={rarity}
                      onClick={() => handleAction(
                        `rarity-${rarity}`,
                        () => onMarkByRarity(rarity),
                        getRarityDisplay(rarity).toLowerCase()
                      )}
                      isLoading={activeAction === `rarity-${rarity}`}
                      disabled={isLoading}
                    >
                      {getRarityDisplay(rarity)}
                    </QuickFillButton>
                  ))}
                </div>
              </div>
            )}

            {/* Reverse Holos */}
            {includeReverseHolos && reverseHoloRarities.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wide">Reverse Holos</div>
                <div className="flex flex-wrap gap-1.5">
                  {sortRarities(reverseHoloRarities).map((rarity) => (
                    <QuickFillButton
                      key={`rh-${rarity}`}
                      onClick={() => handleAction(
                        `rh-${rarity}`,
                        () => onMarkReverseHolosByRarity(rarity),
                        `${getRarityDisplay(rarity).toLowerCase()} reverse holos`
                      )}
                      isLoading={activeAction === `rh-${rarity}`}
                      disabled={isLoading}
                      icon={<Layers className="h-3 w-3" />}
                    >
                      {getRarityDisplay(rarity)}
                    </QuickFillButton>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {sortedRarities.length === 0 && (
              <div className="flex items-center justify-center py-4 text-xs text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading rarities...
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-800" />

            {/* Entire Set */}
            <div className="flex gap-2">
              <QuickFillButton
                onClick={() => setConfirmAction("mark-all")}
                isLoading={activeAction === "mark-all"}
                disabled={isLoading}
                icon={<CheckCircle2 className="h-3 w-3" />}
                variant="success"
                className="flex-1"
              >
                Mark All
              </QuickFillButton>
              <QuickFillButton
                onClick={() => setConfirmAction("clear-all")}
                isLoading={activeAction === "clear-all"}
                disabled={isLoading}
                icon={<Circle className="h-3 w-3" />}
                variant="danger"
                className="flex-1"
              >
                Clear All
              </QuickFillButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          action={confirmAction}
          onConfirm={async () => {
            if (confirmAction === "mark-all") {
              await handleAction("mark-all", onMarkAll, "cards");
            } else if (confirmAction === "clear-all") {
              await handleClearAction("clear-all", onClearAll);
            }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
          isLoading={activeAction === confirmAction}
        />
      )}
    </>
  );
}

// Grid icon component
function GridIcon({ cols, rows, active }: { cols: number; rows: number; active: boolean }) {
  const displayRows = Math.min(rows, 3);
  const displayCols = Math.min(cols, 3);

  return (
    <div
      className={cn(
        "grid gap-[1px]",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-3"
      )}
      style={{ width: "12px", height: cols === 4 ? "12px" : rows === 4 ? "14px" : "10px" }}
    >
      {Array.from({ length: displayCols * displayRows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-[1px]",
            active ? "bg-white" : "bg-zinc-500"
          )}
        />
      ))}
    </div>
  );
}

// Toggle pill component
interface TogglePillProps {
  label: string;
  shortLabel?: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function TogglePill({ label, shortLabel, active, onClick, disabled }: TogglePillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        active
          ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50"
          : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:text-zinc-400 hover:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full transition-colors",
        active ? "bg-emerald-400" : "bg-zinc-600"
      )} />
      <span className="sm:hidden">{shortLabel || label}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Quick fill button for dropdown
interface QuickFillButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "danger";
  className?: string;
}

function QuickFillButton({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  icon,
  variant = "default",
  className,
}: QuickFillButtonProps) {
  const variantStyles = {
    default: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700",
    success: "bg-green-900/30 hover:bg-green-900/50 text-green-400 hover:text-green-300 border-green-800/50",
    danger: "bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border-red-800/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] font-medium",
        "border transition-colors",
        variantStyles[variant],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// Confirmation dialog
interface ConfirmationDialogProps {
  action: "mark-all" | "clear-all";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ConfirmationDialog({ action, onConfirm, onCancel, isLoading }: ConfirmationDialogProps) {
  const config = {
    "mark-all": {
      title: "Mark All Cards as Owned",
      description: "This will mark all cards in this set as owned. Are you sure you want to continue?",
      confirmText: "Yes, Mark All",
      variant: "success" as const,
    },
    "clear-all": {
      title: "Clear All Owned Cards",
      description: "This will remove all cards from your collection for this set. This action cannot be undone.",
      confirmText: "Yes, Clear All",
      variant: "danger" as const,
    },
  };

  const { title, description, confirmText, variant } = config[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-5">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-3",
            variant === "success" && "bg-green-900/30",
            variant === "danger" && "bg-red-900/30"
          )}>
            {variant === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <h3 className="text-base font-semibold text-zinc-100 mb-2">{title}</h3>
          <p className="text-sm text-zinc-400 mb-5">{description}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white",
                "border border-zinc-700 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "flex items-center justify-center gap-2",
                variant === "success" && "bg-green-600 hover:bg-green-500 text-white",
                variant === "danger" && "bg-red-600 hover:bg-red-500 text-white",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
