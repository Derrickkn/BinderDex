import { Database } from "@/lib/supabase/database.types";

// Base types from database
export type Set = Database["public"]["Tables"]["sets"]["Row"];
export type Card = Database["public"]["Tables"]["cards"]["Row"];
export type CardVariant = Database["public"]["Tables"]["card_variants"]["Row"];
export type UserCollection = Database["public"]["Tables"]["user_collections"]["Row"];
export type MasterSetPreference = Database["public"]["Tables"]["master_set_preferences"]["Row"];
export type PromoCard = Database["public"]["Tables"]["promo_cards"]["Row"];
export type UserPromoPreference = Database["public"]["Tables"]["user_promo_preferences"]["Row"];

// Enum types
export type SlotConfig = Database["public"]["Enums"]["slot_config"];
export type VariantType = Database["public"]["Enums"]["variant_type"];

// Extended types for UI
export interface SetWithCardCount extends Set {
  card_count: number;
  owned_count?: number;
}

export interface CardWithVariant extends Card {
  variant_id: string;
  variant_type: VariantType;
  variant_image_url: string | null;
}

export interface TrackerCard extends CardWithVariant {
  owned: boolean;
  quantity: number;
  condition: string | null;
  notes: string | null;
  acquired_date: string | null;
  collection_id: string | null;
  // Promo-specific fields (is_promo is inherited from Card)
  promo_id: string | null;
  promo_number: string | null;
  promo_product_source: string | null;
  is_promo_untracked: boolean;
  is_pokemon_center_exclusive: boolean | null;
}

export interface TrackerPage {
  pageNumber: number;
  cards: TrackerCard[];
}

export interface TrackerProgress {
  totalCards: number;
  ownedCards: number;
  percentage: number;
}

export interface TrackerPreferences {
  slotConfig: SlotConfig;
  includePromos: boolean;
  includeReverseHolos: boolean;
  includePokeball: boolean;
  includeMasterball: boolean;
}

export interface CollectionEntryUpdate {
  quantity: number;
  condition?: string | null;
  notes?: string | null;
  acquired_date?: string | null;
}

// Slot config helpers
export const SLOT_CONFIGS = {
  NINE: { cols: 3, rows: 3, total: 9 },
  TWELVE: { cols: 4, rows: 3, total: 12 },  // 4 columns x 3 rows
  SIXTEEN: { cols: 4, rows: 4, total: 16 },
} as const;

// Card conditions
export const CARD_CONDITIONS = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
] as const;

export type CardCondition = (typeof CARD_CONDITIONS)[number];
