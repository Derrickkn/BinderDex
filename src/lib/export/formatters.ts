import { TrackerCard } from "@/lib/types/tracker";
import { ExportCard } from "./types";

/**
 * Format variant type for display in exports
 */
export function formatVariantForExport(variantType: string): string {
  const specialFormats: Record<string, string> = {
    'NORMAL': 'Normal',
    'REVERSE_HOLO': 'Reverse Holo',
    'POKEBALL': 'Pokeball',
    'MASTERBALL': 'Masterball',
    'FIRST_EDITION': 'First Edition',
    'SHADOWLESS': 'Shadowless',
    'UNLIMITED': 'Unlimited',
  };

  if (specialFormats[variantType]) {
    return specialFormats[variantType];
  }

  // Fallback: capitalize words
  return variantType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format rarity for display in exports
 * Capitalizes first letter of each word
 */
export function formatRarityForExport(rarity: string | null): string {
  if (!rarity) return "Unknown";
  return rarity
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Transform TrackerCard array to ExportCard array
 */
export function formatMissingCardsForExport(
  cards: TrackerCard[],
  setId: string
): ExportCard[] {
  return cards.map((card) => {
    let imageUrl = card.variant_image_url || card.image_small || "";

    // Proxy external URLs through our API to avoid CORS issues
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      imageUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    // Convert relative URLs to absolute URLs
    else if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = `${window.location.origin}${imageUrl}`;
    }

    return {
      name: card.name,
      cardNumber: card.number,
      setId: setId,
      fullSetNumber: `${setId}-${card.number}`,
      rarity: formatRarityForExport(card.rarity),
      variant: formatVariantForExport(card.variant_type),
      imageUrl,
    };
  });
}

/**
 * Sanitize filename for safe file downloads
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

/**
 * Generate a filename for export
 */
export function generateExportFilename(
  setName: string,
  format: "pdf" | "xlsx"
): string {
  const sanitized = sanitizeFilename(setName);
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `BinderDex-${sanitized}-Missing-Cards-${date}.${format}`;
}
