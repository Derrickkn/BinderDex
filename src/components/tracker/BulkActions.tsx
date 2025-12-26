"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Layers, CheckCircle2, Circle, Loader2, Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BulkActionResult = { count: number; error: string | null };

// Confirmation dialog types
type ConfirmAction = "mark-all" | "clear-all" | null;

interface BulkActionsProps {
  rarities: string[];
  reverseHoloRarities: string[];
  includeReverseHolos: boolean;
  onMarkByRarity: (rarity: string) => Promise<BulkActionResult>;
  onMarkReverseHolosByRarity: (rarity: string) => Promise<BulkActionResult>;
  onMarkAll: () => Promise<BulkActionResult>;
  onClearAll: () => Promise<BulkActionResult>;
  isLoading?: boolean;
}

// Map rarity names to shorter display names
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

// Sort rarities in a logical order (common -> rare -> ultra rare)
const RARITY_ORDER = [
  "common",
  "uncommon",
  "rare",
  "rare holo",
  "double rare",
  "ultra rare",
  "illustration rare",
  "special illustration rare",
  "hyper rare",
  "ace spec rare",
  "shiny rare",
  "shiny ultra rare",
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

export function BulkActions({
  rarities,
  reverseHoloRarities,
  includeReverseHolos,
  onMarkByRarity,
  onMarkReverseHolosByRarity,
  onMarkAll,
  onClearAll,
  isLoading = false,
}: BulkActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const sortedRarities = sortRarities(rarities);

  // Auto-hide notification after 3 seconds (5 seconds for errors)
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
    <div className="border-b border-zinc-800 bg-zinc-900/30">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 px-4",
          "text-sm text-zinc-400 hover:text-zinc-300 transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        )}
      >
        <span>Quick Fill</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Expanded actions with animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-3">
            {/* Notification */}
            {notification && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  notification.type === "success" && "bg-green-900/30 text-green-400 border border-green-800/50",
                  notification.type === "info" && "bg-zinc-800 text-zinc-300 border border-zinc-700",
                  notification.type === "error" && "bg-red-900/30 text-red-400 border border-red-800/50"
                )}
              >
                {notification.type === "error" ? (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
                {notification.message}
              </div>
            )}

            {/* By Rarity */}
            <div>
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">By Rarity</div>
              <div className="flex flex-wrap gap-2">
                {sortedRarities.map((rarity) => (
                  <ActionButton
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
                  </ActionButton>
                ))}
              </div>
            </div>

            {/* By Variant Type (Reverse Holos by Rarity) */}
            {includeReverseHolos && reverseHoloRarities.length > 0 && (
              <div>
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Reverse Holos</div>
                <div className="flex flex-wrap gap-2">
                  {sortRarities(reverseHoloRarities).map((rarity) => (
                    <ActionButton
                      key={`rh-${rarity}`}
                      onClick={() => handleAction(
                        `rh-${rarity}`,
                        () => onMarkReverseHolosByRarity(rarity),
                        `${getRarityDisplay(rarity).toLowerCase()} reverse holos`
                      )}
                      isLoading={activeAction === `rh-${rarity}`}
                      disabled={isLoading}
                      icon={<Layers className="h-3.5 w-3.5" />}
                    >
                      {getRarityDisplay(rarity)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            )}

            {/* Set Actions */}
            <div>
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Entire Set</div>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() => setConfirmAction("mark-all")}
                  isLoading={activeAction === "mark-all"}
                  disabled={isLoading}
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  variant="success"
                >
                  Mark All Owned
                </ActionButton>
                <ActionButton
                  onClick={() => setConfirmAction("clear-all")}
                  isLoading={activeAction === "clear-all"}
                  disabled={isLoading}
                  icon={<Circle className="h-3.5 w-3.5" />}
                  variant="danger"
                >
                  Clear All
                </ActionButton>
              </div>
            </div>

            {/* Helper text */}
            <p className="text-xs text-zinc-600 mt-2">
              Click to mark cards as owned. Cards are marked by their position in the set.
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
}

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "danger";
}

function ActionButton({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  icon,
  variant = "default",
}: ActionButtonProps) {
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
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
        "border transition-colors",
        variantStyles[variant],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  action: ConfirmAction;
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

  const { title, description, confirmText, variant } = config[action!];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
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

          {/* Actions */}
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
