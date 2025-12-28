import { z } from "zod";
import {
  uuidSchema,
  setIdSchema,
  nonNegativeIntSchema,
  dateStringSchema,
  slotConfigSchema,
  cardConditionSchema,
} from "./common";

/**
 * Tracker-specific validation schemas
 */

// Toggle card owned
export const toggleCardOwnedSchema = z.object({
  variantId: uuidSchema,
});

export type ToggleCardOwnedInput = z.infer<typeof toggleCardOwnedSchema>;

// Update collection entry (full edit)
export const updateCollectionEntrySchema = z.object({
  variantId: uuidSchema,
  data: z.object({
    quantity: nonNegativeIntSchema,
    condition: cardConditionSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").nullable().optional(),
    acquired_date: dateStringSchema,
  }),
});

export type UpdateCollectionEntryInput = z.infer<typeof updateCollectionEntrySchema>;

// Update tracker preferences
export const updateTrackerPreferencesSchema = z.object({
  setId: setIdSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema.optional(),
    includePromos: z.boolean().optional(),
    includeReverseHolos: z.boolean().optional(),
    includePokeball: z.boolean().optional(),
    includeMasterball: z.boolean().optional(),
  }),
});

export type UpdateTrackerPreferencesInput = z.infer<typeof updateTrackerPreferencesSchema>;

// Get tracker preferences
export const getTrackerPreferencesSchema = z.object({
  setId: setIdSchema,
});

export type GetTrackerPreferencesInput = z.infer<typeof getTrackerPreferencesSchema>;

// Get set by ID
export const getSetByIdSchema = z.object({
  setId: setIdSchema,
});

export type GetSetByIdInput = z.infer<typeof getSetByIdSchema>;

// Get set variants with collection
export const getSetVariantsWithCollectionSchema = z.object({
  setId: setIdSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema,
    includePromos: z.boolean(),
    includeReverseHolos: z.boolean(),
    includePokeball: z.boolean(),
    includeMasterball: z.boolean(),
  }),
});

export type GetSetVariantsWithCollectionInput = z.infer<
  typeof getSetVariantsWithCollectionSchema
>;

// Get set variants
export const getSetVariantsSchema = z.object({
  setId: setIdSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema,
    includePromos: z.boolean(),
    includeReverseHolos: z.boolean(),
    includePokeball: z.boolean(),
    includeMasterball: z.boolean(),
  }),
});

export type GetSetVariantsInput = z.infer<typeof getSetVariantsSchema>;

// Untrack promo (hide)
export const untrackPromoSchema = z.object({
  promoId: uuidSchema,
  setId: setIdSchema,
});

export type UntrackPromoInput = z.infer<typeof untrackPromoSchema>;

// Restore promo
export const restorePromoSchema = z.object({
  promoId: uuidSchema,
  setId: setIdSchema,
});

export type RestorePromoInput = z.infer<typeof restorePromoSchema>;

// Reset promo preferences
export const resetPromoPreferencesSchema = z.object({
  setId: setIdSchema,
});

export type ResetPromoPreferencesInput = z.infer<typeof resetPromoPreferencesSchema>;

// Get hidden promo count
export const getHiddenPromoCountSchema = z.object({
  setId: setIdSchema,
});

export type GetHiddenPromoCountInput = z.infer<typeof getHiddenPromoCountSchema>;

// Get hidden promos
export const getHiddenPromosSchema = z.object({
  setId: setIdSchema,
});

export type GetHiddenPromosInput = z.infer<typeof getHiddenPromosSchema>;

// Get set progress
export const getSetProgressSchema = z.object({
  setId: setIdSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema,
    includePromos: z.boolean(),
    includeReverseHolos: z.boolean(),
    includePokeball: z.boolean(),
    includeMasterball: z.boolean(),
  }),
});

export type GetSetProgressInput = z.infer<typeof getSetProgressSchema>;

// Bulk mark criteria schemas
const bulkMarkAllSchema = z.object({
  type: z.literal("all"),
});

const bulkMarkRaritySchema = z.object({
  type: z.literal("rarity"),
  rarity: z.string().min(1, "Rarity is required"),
});

const bulkMarkVariantSchema = z.object({
  type: z.literal("variant"),
  variantType: z.enum(["NORMAL", "REVERSE_HOLO", "POKEBALL", "MASTERBALL"]),
});

const bulkMarkVariantWithRaritySchema = z.object({
  type: z.literal("variantWithRarity"),
  variantType: z.enum(["REVERSE_HOLO", "POKEBALL", "MASTERBALL"]),
  rarity: z.string().min(1, "Rarity is required"),
});

const bulkMarkUnownedSchema = z.object({
  type: z.literal("unowned"),
});

export const bulkMarkCriteriaSchema = z.discriminatedUnion("type", [
  bulkMarkAllSchema,
  bulkMarkRaritySchema,
  bulkMarkVariantSchema,
  bulkMarkVariantWithRaritySchema,
  bulkMarkUnownedSchema,
]);

export type BulkMarkCriteriaInput = z.infer<typeof bulkMarkCriteriaSchema>;

// Bulk mark as owned
export const bulkMarkAsOwnedSchema = z.object({
  setId: setIdSchema,
  criteria: bulkMarkCriteriaSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema,
    includePromos: z.boolean(),
    includeReverseHolos: z.boolean(),
    includePokeball: z.boolean(),
    includeMasterball: z.boolean(),
  }),
});

export type BulkMarkAsOwnedInput = z.infer<typeof bulkMarkAsOwnedSchema>;

// Bulk unmark owned
export const bulkUnmarkOwnedSchema = z.object({
  setId: setIdSchema,
  criteria: bulkMarkCriteriaSchema,
  preferences: z.object({
    slotConfig: slotConfigSchema,
    includePromos: z.boolean(),
    includeReverseHolos: z.boolean(),
    includePokeball: z.boolean(),
    includeMasterball: z.boolean(),
  }),
});

export type BulkUnmarkOwnedInput = z.infer<typeof bulkUnmarkOwnedSchema>;

// Get user collection for set
export const getUserCollectionForSetSchema = z.object({
  setId: setIdSchema,
});

export type GetUserCollectionForSetInput = z.infer<typeof getUserCollectionForSetSchema>;

// Get set rarities
export const getSetRaritiesSchema = z.object({
  setId: setIdSchema,
});

export type GetSetRaritiesInput = z.infer<typeof getSetRaritiesSchema>;

// Get set reverse holo rarities
export const getSetReverseHoloRaritiesSchema = z.object({
  setId: setIdSchema,
});

export type GetSetReverseHoloRaritiesInput = z.infer<typeof getSetReverseHoloRaritiesSchema>;

// Get set Pokeball rarities
export const getSetPokeballRaritiesSchema = z.object({
  setId: setIdSchema,
});

export type GetSetPokeballRaritiesInput = z.infer<typeof getSetPokeballRaritiesSchema>;

// Get set Masterball rarities
export const getSetMasterballRaritiesSchema = z.object({
  setId: setIdSchema,
});

export type GetSetMasterballRaritiesInput = z.infer<typeof getSetMasterballRaritiesSchema>;
