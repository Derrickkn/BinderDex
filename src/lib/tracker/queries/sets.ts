"use server";

import { createClient } from "@/lib/supabase/server";
import { SetWithCardCount, TrackerPreferences } from "@/lib/types/tracker";

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
          is_promo,
          number
        )
      )
    `)
    .eq("user_id", user.id)
    .gt("quantity", 0);

  if (collError) {
    return { data: null, error: collError.message };
  }

  // Fetch promo metadata and untracked preferences for all tracked sets
  // This is needed to exclude untracked promos from total counts
  const { data: promoCards } = await supabase
    .from("promo_cards")
    .select("id, set_id, promo_number");

  const promoNumberToIdMap = new Map<string, { setId: string; promoId: string }>();
  if (promoCards) {
    for (const pc of promoCards) {
      promoNumberToIdMap.set(pc.promo_number, { setId: pc.set_id, promoId: pc.id });
    }
  }

  // Fetch untracked promo preferences for this user
  const { data: untrackedPrefs } = await supabase
    .from("user_promo_preferences")
    .select("promo_id, set_id")
    .eq("user_id", user.id)
    .eq("is_tracked", false);

  const untrackedPromoIds = new Set<string>();
  if (untrackedPrefs) {
    for (const pref of untrackedPrefs) {
      untrackedPromoIds.add(pref.promo_id);
    }
  }

  // Identify which sets the user is tracking (has at least one owned card)
  const trackedSetIds = new Set<string>();
  for (const entry of collection) {
    const cardVariant = entry.card_variants as unknown as {
      card_id: string;
      variant_type: string;
      cards: { set_id: string; is_promo: boolean; number: string };
    };
    if (cardVariant?.cards?.set_id) {
      trackedSetIds.add(cardVariant.cards.set_id);
    }
  }

  // Get all variants ONLY for tracked sets (avoids Supabase's 1000 row default limit issue)
  // We query per-set to ensure we get all variants for each tracked set
  const setTotals = new Map<string, number>();

  for (const setId of Array.from(trackedSetIds)) {
    const prefs = prefsMap.get(setId) || { includeReverseHolos: false, includePromos: false };

    // Query variants for this specific set with a higher limit to ensure we get all cards
    // Most sets have < 500 variants, so 1000 limit per set should be sufficient
    const { data: setVariants, error: setVarError } = await supabase
      .from("card_variants")
      .select(`
        id,
        variant_type,
        cards!inner(
          set_id,
          is_promo,
          number
        )
      `)
      .eq("cards.set_id", setId)
      .limit(2000); // Increase limit to handle large sets

    if (setVarError) {
      console.error(`Error fetching variants for set ${setId}:`, setVarError);
      continue;
    }

    let totalCount = 0;
    for (const variant of setVariants || []) {
      const v = variant as unknown as {
        id: string;
        variant_type: string;
        cards: { set_id: string; is_promo: boolean; number: string };
      };

      // Skip promos if not included
      if (v.cards.is_promo && !prefs.includePromos) continue;

      // Skip promos that the user has specifically untracked
      if (v.cards.is_promo && v.cards.number) {
        const promoInfo = promoNumberToIdMap.get(v.cards.number);
        if (promoInfo && untrackedPromoIds.has(promoInfo.promoId)) {
          continue; // Skip untracked promo
        }
      }

      // Only count NORMAL or REVERSE_HOLO based on preferences
      if (v.variant_type === "NORMAL") {
        totalCount++;
      } else if (v.variant_type === "REVERSE_HOLO" && prefs.includeReverseHolos) {
        totalCount++;
      }
    }

    setTotals.set(setId, totalCount);
  }

  // Count owned cards per set based on preferences
  const ownedPerSet = new Map<string, number>();
  for (const entry of collection) {
    const cardVariant = entry.card_variants as unknown as {
      card_id: string;
      variant_type: string;
      cards: { set_id: string; is_promo: boolean; number: string };
    };
    const setId = cardVariant?.cards?.set_id;
    if (!setId) continue;

    const prefs = prefsMap.get(setId) || { includeReverseHolos: false, includePromos: false };

    // Skip promos if not included
    if (cardVariant.cards.is_promo && !prefs.includePromos) continue;

    // Skip promos that the user has specifically untracked
    if (cardVariant.cards.is_promo && cardVariant.cards.number) {
      const promoInfo = promoNumberToIdMap.get(cardVariant.cards.number);
      if (promoInfo && untrackedPromoIds.has(promoInfo.promoId)) {
        continue; // Skip untracked promo
      }
    }

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
  // Import the function here to avoid circular dependency
  const { getSetVariants } = await import("./variants");
  const { getUserCollectionForSet } = await import("./collection");

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

export async function getSetPokeballRarities(setId: string): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Get cards that have POKEBALL variants
  const { data: cards, error } = await supabase
    .from("cards")
    .select(`
      rarity,
      card_variants!inner(variant_type)
    `)
    .eq("set_id", setId)
    .eq("card_variants.variant_type", "POKEBALL")
    .not("rarity", "is", null);

  if (error) {
    return { data: null, error: error.message };
  }

  // Get unique rarities
  const uniqueRarities = new Set(cards.map(c => c.rarity).filter(Boolean));
  const rarities = Array.from(uniqueRarities).sort();

  return { data: rarities as string[], error: null };
}

export async function getSetMasterballRarities(setId: string): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Get cards that have MASTERBALL variants
  const { data: cards, error } = await supabase
    .from("cards")
    .select(`
      rarity,
      card_variants!inner(variant_type)
    `)
    .eq("set_id", setId)
    .eq("card_variants.variant_type", "MASTERBALL")
    .not("rarity", "is", null);

  if (error) {
    return { data: null, error: error.message };
  }

  // Get unique rarities
  const uniqueRarities = new Set(cards.map(c => c.rarity).filter(Boolean));
  const rarities = Array.from(uniqueRarities).sort();

  return { data: rarities as string[], error: null };
}
