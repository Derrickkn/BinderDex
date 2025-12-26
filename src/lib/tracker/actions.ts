"use server";

import { createClient } from "@/lib/supabase/server";
import {
  SetWithCardCount,
  CardWithVariant,
  TrackerCard,
  TrackerPreferences,
  CollectionEntryUpdate,
} from "@/lib/types/tracker";

/**
 * Get all sets that have cards in the database
 */
export async function getAvailableSets(): Promise<{
  data: SetWithCardCount[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: sets, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      cards(count)
    `
    )
    .order("release_date", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Transform the data to include card_count
  const setsWithCount: SetWithCardCount[] = sets.map((set) => ({
    ...set,
    card_count: (set.cards as unknown as { count: number }[])?.[0]?.count || 0,
  }));

  // Filter out sets with no cards
  const filteredSets = setsWithCount.filter((set) => set.card_count > 0);

  return { data: filteredSets, error: null };
}

/**
 * Get set IDs that the user is tracking (has at least one card owned)
 */
export async function getTrackedSetIds(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  // Get all collection entries with quantity > 0 and join to get set_id
  const { data: tracked, error } = await supabase
    .from("user_collections")
    .select(`
      variant_id,
      quantity,
      card_variants!inner(
        card_id,
        cards!inner(
          set_id
        )
      )
    `)
    .eq("user_id", user.id)
    .gt("quantity", 0);

  if (error) {
    return { data: null, error: error.message };
  }

  // Extract unique set IDs
  const setIds = new Set<string>();
  for (const entry of tracked) {
    const cardVariant = entry.card_variants as unknown as {
      card_id: string;
      cards: { set_id: string };
    };
    if (cardVariant?.cards?.set_id) {
      setIds.add(cardVariant.cards.set_id);
    }
  }

  return { data: Array.from(setIds), error: null };
}

/**
 * Get a single set by ID
 */
export async function getSetById(setId: string): Promise<{
  data: SetWithCardCount | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: set, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      cards(count)
    `
    )
    .eq("id", setId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const setWithCount: SetWithCardCount = {
    ...set,
    card_count: (set.cards as unknown as { count: number }[])?.[0]?.count || 0,
  };

  return { data: setWithCount, error: null };
}

/**
 * Get cards with variants for a set, filtered by preferences
 */
export async function getSetVariants(
  setId: string,
  preferences: TrackerPreferences
): Promise<{
  data: CardWithVariant[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Build the query
  let query = supabase
    .from("cards")
    .select(
      `
      *,
      card_variants!inner(
        id,
        variant_type,
        image_url
      )
    `
    )
    .eq("set_id", setId);

  // Filter promos if not included
  if (!preferences.includePromos) {
    query = query.eq("is_promo", false);
  }

  const { data: cards, error } = await query.order("number");

  if (error) {
    return { data: null, error: error.message };
  }

  // Flatten the variants into cards
  const cardsWithVariants: CardWithVariant[] = [];

  for (const card of cards) {
    const variants = card.card_variants as unknown as Array<{
      id: string;
      variant_type: string;
      image_url: string | null;
    }>;

    for (const variant of variants) {
      // Filter variants based on preferences
      if (variant.variant_type === "NORMAL") {
        cardsWithVariants.push({
          ...card,
          card_variants: undefined,
          variant_id: variant.id,
          variant_type: variant.variant_type as CardWithVariant["variant_type"],
          variant_image_url: variant.image_url,
        } as CardWithVariant);
      } else if (
        variant.variant_type === "REVERSE_HOLO" &&
        preferences.includeReverseHolos
      ) {
        cardsWithVariants.push({
          ...card,
          card_variants: undefined,
          variant_id: variant.id,
          variant_type: variant.variant_type as CardWithVariant["variant_type"],
          variant_image_url: variant.image_url,
        } as CardWithVariant);
      }
    }
  }

  // Sort by number then variant type
  cardsWithVariants.sort((a, b) => {
    const numA = parseInt(a.number, 10);
    const numB = parseInt(b.number, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    } else {
      const strCompare = a.number.localeCompare(b.number, undefined, {
        numeric: true,
      });
      if (strCompare !== 0) return strCompare;
    }

    // NORMAL before REVERSE_HOLO
    return a.variant_type.localeCompare(b.variant_type);
  });

  return { data: cardsWithVariants, error: null };
}

/**
 * Get user's collection entries for a set
 */
export async function getUserCollectionForSet(setId: string): Promise<{
  data: Map<string, TrackerCard> | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: new Map(), error: null };
  }

  const { data: collection, error } = await supabase
    .from("user_collections")
    .select(
      `
      *,
      card_variants!inner(
        id,
        card_id,
        cards!inner(
          set_id
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  // Filter to only this set and create a map by variant_id
  const collectionMap = new Map<string, TrackerCard>();

  for (const entry of collection) {
    const cardVariant = entry.card_variants as unknown as {
      id: string;
      card_id: string;
      cards: { set_id: string };
    };

    if (cardVariant.cards.set_id === setId) {
      collectionMap.set(entry.variant_id, {
        owned: entry.quantity > 0,
        quantity: entry.quantity,
        condition: entry.condition,
        notes: entry.notes,
        acquired_date: entry.acquired_date,
        collection_id: entry.id,
      } as unknown as TrackerCard);
    }
  }

  return { data: collectionMap, error: null };
}

/**
 * Get or create tracker preferences for a set
 */
export async function getTrackerPreferences(setId: string): Promise<{
  data: TrackerPreferences | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return default preferences for guests
    return {
      data: {
        slotConfig: "NINE",
        includePromos: false,
        includeReverseHolos: false,
      },
      error: null,
    };
  }

  const { data: prefs, error } = await supabase
    .from("master_set_preferences")
    .select("*")
    .eq("user_id", user.id)
    .eq("set_id", setId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    return { data: null, error: error.message };
  }

  if (!prefs) {
    // Return default preferences
    return {
      data: {
        slotConfig: "NINE",
        includePromos: false,
        includeReverseHolos: false,
      },
      error: null,
    };
  }

  return {
    data: {
      slotConfig: prefs.slot_config,
      includePromos: prefs.include_promos ?? false,
      includeReverseHolos: prefs.include_reverse_holos ?? false,
    },
    error: null,
  };
}

/**
 * Update tracker preferences for a set
 */
export async function updateTrackerPreferences(
  setId: string,
  preferences: Partial<TrackerPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Must be logged in to save preferences" };
  }

  const updateData: Record<string, unknown> = {};
  if (preferences.slotConfig !== undefined) {
    updateData.slot_config = preferences.slotConfig;
  }
  if (preferences.includePromos !== undefined) {
    updateData.include_promos = preferences.includePromos;
  }
  if (preferences.includeReverseHolos !== undefined) {
    updateData.include_reverse_holos = preferences.includeReverseHolos;
  }

  const { error } = await supabase.from("master_set_preferences").upsert(
    {
      user_id: user.id,
      set_id: setId,
      ...updateData,
    },
    {
      onConflict: "user_id,set_id",
    }
  );

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Toggle card owned status (quick toggle)
 */
export async function toggleCardOwned(variantId: string): Promise<{
  data: { owned: boolean; quantity: number } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Must be logged in to track collection" };
  }

  // Check if entry exists
  const { data: existing } = await supabase
    .from("user_collections")
    .select("*")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .single();

  if (existing && existing.quantity > 0) {
    // Mark as not owned
    const { error } = await supabase
      .from("user_collections")
      .update({ quantity: 0 })
      .eq("id", existing.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { owned: false, quantity: 0 }, error: null };
  } else if (existing) {
    // Mark as owned
    const { error } = await supabase
      .from("user_collections")
      .update({ quantity: 1 })
      .eq("id", existing.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { owned: true, quantity: 1 }, error: null };
  } else {
    // Create new entry
    const { error } = await supabase.from("user_collections").insert({
      user_id: user.id,
      variant_id: variantId,
      quantity: 1,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { owned: true, quantity: 1 }, error: null };
  }
}

/**
 * Update collection entry (full edit from modal)
 */
export async function updateCollectionEntry(
  variantId: string,
  data: CollectionEntryUpdate
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Must be logged in to update collection" };
  }

  // Check if entry exists
  const { data: existing } = await supabase
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .single();

  if (existing) {
    // Update existing entry
    const { error } = await supabase
      .from("user_collections")
      .update({
        quantity: data.quantity,
        condition: data.condition,
        notes: data.notes,
        acquired_date: data.acquired_date,
      })
      .eq("id", existing.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new entry
    const { error } = await supabase.from("user_collections").insert({
      user_id: user.id,
      variant_id: variantId,
      quantity: data.quantity,
      condition: data.condition,
      notes: data.notes,
      acquired_date: data.acquired_date,
    });

    if (error) {
      return { error: error.message };
    }
  }

  return { error: null };
}

/**
 * Get progress for all tracked sets (for the tracker page listing)
 * Respects user preferences for each set (includeReverseHolos, includePromos)
 */
export async function getTrackedSetsProgress(): Promise<{
  data: Record<string, { ownedCount: number; totalCount: number; percentage: number }> | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: {}, error: null };
  }

  // Get user's preferences for all sets
  const { data: allPreferences, error: prefsError } = await supabase
    .from("master_set_preferences")
    .select("set_id, include_reverse_holos, include_promos")
    .eq("user_id", user.id);

  if (prefsError) {
    return { data: null, error: prefsError.message };
  }

  // Build preferences map (default: no reverse holos, no promos)
  const prefsMap = new Map<string, { includeReverseHolos: boolean; includePromos: boolean }>();
  for (const pref of allPreferences || []) {
    prefsMap.set(pref.set_id, {
      includeReverseHolos: pref.include_reverse_holos ?? false,
      includePromos: pref.include_promos ?? false,
    });
  }

  // Get all collection entries with quantity > 0
  const { data: collection, error: collError } = await supabase
    .from("user_collections")
    .select(`
      variant_id,
      quantity,
      card_variants!inner(
        card_id,
        variant_type,
        cards!inner(
          set_id,
          is_promo
        )
      )
    `)
    .eq("user_id", user.id)
    .gt("quantity", 0);

  if (collError) {
    return { data: null, error: collError.message };
  }

  // Get all variants grouped by set for total counts
  const { data: allVariants, error: variantsError } = await supabase
    .from("card_variants")
    .select(`
      id,
      variant_type,
      cards!inner(
        set_id,
        is_promo
      )
    `);

  if (variantsError) {
    return { data: null, error: variantsError.message };
  }

  // Identify which sets the user is tracking (has at least one owned card)
  const trackedSetIds = new Set<string>();
  for (const entry of collection) {
    const cardVariant = entry.card_variants as unknown as {
      card_id: string;
      variant_type: string;
      cards: { set_id: string; is_promo: boolean };
    };
    if (cardVariant?.cards?.set_id) {
      trackedSetIds.add(cardVariant.cards.set_id);
    }
  }

  // Calculate totals per set based on preferences
  const setTotals = new Map<string, number>();
  for (const variant of allVariants) {
    const v = variant as unknown as {
      id: string;
      variant_type: string;
      cards: { set_id: string; is_promo: boolean };
    };
    const setId = v.cards?.set_id;
    if (!setId || !trackedSetIds.has(setId)) continue;

    const prefs = prefsMap.get(setId) || { includeReverseHolos: false, includePromos: false };

    // Skip promos if not included
    if (v.cards.is_promo && !prefs.includePromos) continue;

    // Only count NORMAL or REVERSE_HOLO based on preferences
    if (v.variant_type === "NORMAL") {
      setTotals.set(setId, (setTotals.get(setId) || 0) + 1);
    } else if (v.variant_type === "REVERSE_HOLO" && prefs.includeReverseHolos) {
      setTotals.set(setId, (setTotals.get(setId) || 0) + 1);
    }
  }

  // Count owned cards per set based on preferences
  const ownedPerSet = new Map<string, number>();
  for (const entry of collection) {
    const cardVariant = entry.card_variants as unknown as {
      card_id: string;
      variant_type: string;
      cards: { set_id: string; is_promo: boolean };
    };
    const setId = cardVariant?.cards?.set_id;
    if (!setId) continue;

    const prefs = prefsMap.get(setId) || { includeReverseHolos: false, includePromos: false };

    // Skip promos if not included
    if (cardVariant.cards.is_promo && !prefs.includePromos) continue;

    // Only count NORMAL or REVERSE_HOLO based on preferences
    if (cardVariant.variant_type === "NORMAL") {
      ownedPerSet.set(setId, (ownedPerSet.get(setId) || 0) + 1);
    } else if (cardVariant.variant_type === "REVERSE_HOLO" && prefs.includeReverseHolos) {
      ownedPerSet.set(setId, (ownedPerSet.get(setId) || 0) + 1);
    }
  }

  // Build progress map
  const progress: Record<string, { ownedCount: number; totalCount: number; percentage: number }> = {};
  trackedSetIds.forEach((setId) => {
    const ownedCount = ownedPerSet.get(setId) || 0;
    const totalCount = setTotals.get(setId) || 0;
    const percentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;
    progress[setId] = { ownedCount, totalCount, percentage };
  });

  return { data: progress, error: null };
}

/**
 * Get user's progress for a set (owned count / total count)
 */
export async function getSetProgress(
  setId: string,
  preferences: TrackerPreferences
): Promise<{
  data: { ownedCount: number; totalCount: number; percentage: number } | null;
  error: string | null;
}> {
  // Get all variants for the set
  const { data: variants, error: variantsError } = await getSetVariants(
    setId,
    preferences
  );

  if (variantsError || !variants) {
    return { data: null, error: variantsError };
  }

  const totalCount = variants.length;

  // Get user's collection
  const { data: collection, error: collectionError } =
    await getUserCollectionForSet(setId);

  if (collectionError) {
    return { data: null, error: collectionError };
  }

  // Count owned variants
  let ownedCount = 0;
  for (const variant of variants) {
    const entry = collection?.get(variant.variant_id);
    if (entry && entry.quantity > 0) {
      ownedCount++;
    }
  }

  const percentage =
    totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return { data: { ownedCount, totalCount, percentage }, error: null };
}

/**
 * Bulk mark cards as owned by criteria
 */
export type BulkMarkCriteria =
  | { type: "all" }
  | { type: "rarity"; rarity: string }
  | { type: "variant"; variantType: "NORMAL" | "REVERSE_HOLO" }
  | { type: "variantWithRarity"; variantType: "REVERSE_HOLO"; rarity: string }
  | { type: "unowned" };

export async function bulkMarkAsOwned(
  setId: string,
  criteria: BulkMarkCriteria,
  preferences: TrackerPreferences
): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: "Must be logged in to update collection" };
  }

  // Get variants for the set based on preferences
  const { data: variants, error: variantsError } = await getSetVariants(setId, preferences);

  if (variantsError || !variants) {
    return { count: 0, error: variantsError || "Failed to fetch variants" };
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
    return { count: 0, error: upsertError.message };
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: "Must be logged in to update collection" };
  }

  // Get variants for the set based on preferences
  const { data: variants, error: variantsError } = await getSetVariants(setId, preferences);

  if (variantsError || !variants) {
    return { count: 0, error: variantsError || "Failed to fetch variants" };
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
    return { count: 0, error: updateError.message };
  }

  return { count: variantIdsToUnmark.length, error: null };
}

/**
 * Get available rarities for a set
 */
export async function getSetRarities(setId: string): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: cards, error } = await supabase
    .from("cards")
    .select("rarity")
    .eq("set_id", setId)
    .not("rarity", "is", null);

  if (error) {
    return { data: null, error: error.message };
  }

  // Get unique rarities
  const uniqueRarities = new Set(cards.map(c => c.rarity).filter(Boolean));
  const rarities = Array.from(uniqueRarities).sort();

  return { data: rarities as string[], error: null };
}

/**
 * Get rarities that have reverse holo variants for a set
 */
export async function getSetReverseHoloRarities(setId: string): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Get cards that have REVERSE_HOLO variants
  const { data: cards, error } = await supabase
    .from("cards")
    .select(`
      rarity,
      card_variants!inner(variant_type)
    `)
    .eq("set_id", setId)
    .eq("card_variants.variant_type", "REVERSE_HOLO")
    .not("rarity", "is", null);

  if (error) {
    return { data: null, error: error.message };
  }

  // Get unique rarities
  const uniqueRarities = new Set(cards.map(c => c.rarity).filter(Boolean));
  const rarities = Array.from(uniqueRarities).sort();

  return { data: rarities as string[], error: null };
}
