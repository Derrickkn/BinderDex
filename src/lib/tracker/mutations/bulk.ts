"use server";

import { createClient } from "@/lib/supabase/server";
import { TrackerPreferences } from "@/lib/types/tracker";
import { bulkMarkAsOwnedSchema, bulkUnmarkOwnedSchema } from "@/lib/validation/tracker";
import { AuthenticationError, ValidationError, mapSupabaseError } from "@/lib/errors";
import { formatValidationError } from "@/lib/validation/common";

/**
 * Bulk mark cards as owned by criteria
 */
export type BulkMarkCriteria =
  | { type: "all" }
  | { type: "rarity"; rarity: string }
  | { type: "variant"; variantType: "NORMAL" | "REVERSE_HOLO" | "POKEBALL" | "MASTERBALL" }
  | { type: "variantWithRarity"; variantType: "REVERSE_HOLO" | "POKEBALL" | "MASTERBALL"; rarity: string }
  | { type: "unowned" };

export async function bulkMarkAsOwned(
  setId: string,
  criteria: BulkMarkCriteria,
  preferences: TrackerPreferences
): Promise<{ count: number; error: string | null }> {
  // Validate input
  const validationResult = bulkMarkAsOwnedSchema.safeParse({ setId, criteria, preferences });
  if (!validationResult.success) {
    const formattedError = formatValidationError(validationResult.error);
    throw new ValidationError(formattedError.error);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError();
  }

  // Import functions here to avoid circular dependency
  const { getSetVariants } = await import("../queries/variants");
  const { getUserCollectionForSet } = await import("../queries/collection");

  // Get variants for the set based on preferences
  const { data: variants, error: variantsError } = await getSetVariants(setId, preferences);

  if (variantsError || !variants) {
    throw new Error(variantsError || "Failed to fetch variants");
  }

  // Get current collection to know what's already owned
  const { data: collection } = await getUserCollectionForSet(setId);

  // Filter variants based on criteria
  let variantsToMark = variants;

  switch (criteria.type) {
    case "rarity":
      // Only mark NORMAL variants when filtering by rarity (not reverse holos)
      variantsToMark = variants.filter(v =>
        v.rarity?.toLowerCase() === criteria.rarity.toLowerCase() &&
        v.variant_type === "NORMAL"
      );
      break;
    case "variant":
      variantsToMark = variants.filter(v => v.variant_type === criteria.variantType);
      break;
    case "variantWithRarity":
      // Mark specific variant type with a specific rarity (e.g., Common Reverse Holos)
      variantsToMark = variants.filter(v =>
        v.variant_type === criteria.variantType &&
        v.rarity?.toLowerCase() === criteria.rarity.toLowerCase()
      );
      break;
    case "unowned":
      variantsToMark = variants.filter(v => {
        const entry = collection?.get(v.variant_id);
        return !entry || entry.quantity === 0;
      });
      break;
    case "all":
      // Keep all variants
      break;
  }

  // Filter out already owned cards (except for "all" which we still process to ensure they're marked)
  const variantIdsToMark = variantsToMark
    .filter(v => {
      const entry = collection?.get(v.variant_id);
      return !entry || entry.quantity === 0;
    })
    .map(v => v.variant_id);

  if (variantIdsToMark.length === 0) {
    return { count: 0, error: null };
  }

  // Bulk upsert - mark all as owned with quantity 1
  const upsertData = variantIdsToMark.map(variantId => ({
    user_id: user.id,
    variant_id: variantId,
    quantity: 1,
  }));

  const { error: upsertError } = await supabase
    .from("user_collections")
    .upsert(upsertData, { onConflict: "user_id,variant_id" });

  if (upsertError) {
    throw mapSupabaseError(upsertError);
  }

  return { count: variantIdsToMark.length, error: null };
}

/**
 * Bulk unmark cards (set quantity to 0) by criteria
 */
export async function bulkUnmarkOwned(
  setId: string,
  criteria: BulkMarkCriteria,
  preferences: TrackerPreferences
): Promise<{ count: number; error: string | null }> {
  // Validate input
  const validationResult = bulkUnmarkOwnedSchema.safeParse({ setId, criteria, preferences });
  if (!validationResult.success) {
    const formattedError = formatValidationError(validationResult.error);
    throw new ValidationError(formattedError.error);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError();
  }

  // Import functions here to avoid circular dependency
  const { getSetVariants } = await import("../queries/variants");
  const { getUserCollectionForSet } = await import("../queries/collection");

  // Get variants for the set based on preferences
  const { data: variants, error: variantsError } = await getSetVariants(setId, preferences);

  if (variantsError || !variants) {
    throw new Error(variantsError || "Failed to fetch variants");
  }

  // Get current collection
  const { data: collection } = await getUserCollectionForSet(setId);

  // Filter variants based on criteria
  let variantsToUnmark = variants;

  switch (criteria.type) {
    case "rarity":
      // Only unmark NORMAL variants when filtering by rarity (not reverse holos)
      variantsToUnmark = variants.filter(v =>
        v.rarity?.toLowerCase() === criteria.rarity.toLowerCase() &&
        v.variant_type === "NORMAL"
      );
      break;
    case "variant":
      variantsToUnmark = variants.filter(v => v.variant_type === criteria.variantType);
      break;
    case "variantWithRarity":
      // Unmark specific variant type with a specific rarity (e.g., Common Reverse Holos)
      variantsToUnmark = variants.filter(v =>
        v.variant_type === criteria.variantType &&
        v.rarity?.toLowerCase() === criteria.rarity.toLowerCase()
      );
      break;
    case "unowned":
      // Can't unmark unowned cards
      return { count: 0, error: null };
    case "all":
      // Keep all variants
      break;
  }

  // Only unmark cards that are currently owned
  const variantIdsToUnmark = variantsToUnmark
    .filter(v => {
      const entry = collection?.get(v.variant_id);
      return entry && entry.quantity > 0;
    })
    .map(v => v.variant_id);

  if (variantIdsToUnmark.length === 0) {
    return { count: 0, error: null };
  }

  // Update all to quantity 0
  const { error: updateError } = await supabase
    .from("user_collections")
    .update({ quantity: 0 })
    .eq("user_id", user.id)
    .in("variant_id", variantIdsToUnmark);

  if (updateError) {
    throw mapSupabaseError(updateError);
  }

  return { count: variantIdsToUnmark.length, error: null };
}
