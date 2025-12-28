"use server";

import { createClient } from "@/lib/supabase/server";
import { CardWithVariant, TrackerCard, TrackerPreferences } from "@/lib/types/tracker";
import { getVariantSortOrder } from "../tracker-utils";

/**
 * Get cards with variants AND collection data for a set in a single optimized query
 * OPTIMIZED: Uses LEFT JOIN to eliminate client-side merge
 */
export async function getSetVariantsWithCollection(
  setId: string,
  preferences: TrackerPreferences
): Promise<{
  data: TrackerCard[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build the query with nested LEFT JOIN to user_collections
  // NOTE: promo_cards is NOT joined here because there's no FK relationship between cards and promo_cards.
  // Promo metadata is fetched separately below when includePromos is true.
  let query = supabase
    .from("cards")
    .select(
      `
      *,
      card_variants!inner(
        id,
        variant_type,
        image_url,
        user_collections(
          id,
          quantity,
          condition,
          notes,
          acquired_date
        )
      )
    `
    )
    .eq("set_id", setId);

  // Filter by user if authenticated (only get this user's collection entries)
  if (user) {
    query = query.eq("card_variants.user_collections.user_id", user.id);
  }

  // Filter promos if not included
  if (!preferences.includePromos) {
    query = query.eq("is_promo", false);
  }

  const { data: cards, error } = await query.order("number");

  if (error) {
    return { data: null, error: error.message };
  }

  // Fetch promo metadata and untracked promo preferences separately (no FK between cards and promo_cards)
  const promoMetadataMap: Map<string, { id: string; promo_number: string; product_source: string; is_pokemon_center_exclusive: boolean | null }> = new Map();
  let untrackedPromoIds: Set<string> = new Set();

  if (preferences.includePromos) {
    // Fetch promo metadata for this set (keyed by promo_number which matches cards.number)
    const { data: promoCards } = await supabase
      .from("promo_cards")
      .select("id, promo_number, product_source, is_pokemon_center_exclusive")
      .eq("set_id", setId);

    if (promoCards) {
      for (const pc of promoCards) {
        promoMetadataMap.set(pc.promo_number, pc);
      }
    }

    // Get untracked promos for this user (if authenticated)
    if (user) {
      const { data: untrackedPrefs } = await supabase
        .from("user_promo_preferences")
        .select("promo_id")
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("is_tracked", false);

      if (untrackedPrefs) {
        untrackedPromoIds = new Set(untrackedPrefs.map(p => p.promo_id));
      }
    }
  }

  // Flatten the variants into TrackerCards with collection data already joined
  const trackerCards: TrackerCard[] = [];

  for (const card of cards) {
    const variants = card.card_variants as unknown as Array<{
      id: string;
      variant_type: string;
      image_url: string | null;
      user_collections: Array<{
        id: string;
        quantity: number;
        condition: string | null;
        notes: string | null;
        acquired_date: string | null;
      }> | null;
    }>;

    // Get promo metadata if this is a promo card (lookup by card.number)
    const promoInfo = card.is_promo ? promoMetadataMap.get(card.number) || null : null;

    // Skip this promo if user has untracked it
    if (card.is_promo && promoInfo && untrackedPromoIds.has(promoInfo.id)) {
      continue;
    }

    for (const variant of variants) {
      // Get collection data if it exists
      const collection = variant.user_collections?.[0] || null;

      // Filter variants based on preferences
      const shouldInclude =
        variant.variant_type === "NORMAL" ||
        (variant.variant_type === "REVERSE_HOLO" && preferences.includeReverseHolos) ||
        (variant.variant_type === "POKEBALL" && preferences.includePokeball) ||
        (variant.variant_type === "MASTERBALL" && preferences.includeMasterball);

      if (shouldInclude) {
        trackerCards.push({
          ...card,
          card_variants: undefined,
          variant_id: variant.id,
          variant_type: variant.variant_type as CardWithVariant["variant_type"],
          variant_image_url: variant.image_url,
          owned: collection?.quantity ? collection.quantity > 0 : false,
          quantity: collection?.quantity || 0,
          condition: collection?.condition || null,
          notes: collection?.notes || null,
          acquired_date: collection?.acquired_date || null,
          collection_id: collection?.id || null,
          // Promo-specific fields (is_promo is inherited from card via spread)
          promo_id: promoInfo?.id ?? null,
          promo_number: promoInfo?.promo_number ?? null,
          promo_product_source: promoInfo?.product_source ?? null,
          is_promo_untracked: false, // If we got here, it's not untracked
          is_pokemon_center_exclusive: promoInfo?.is_pokemon_center_exclusive ?? null,
        } as TrackerCard);
      }
    }
  }

  // Sort: regular cards first (by number), then promos at the end
  trackerCards.sort((a, b) => {
    // Promos always come after regular cards
    if (a.is_promo && !b.is_promo) return 1;
    if (!a.is_promo && b.is_promo) return -1;

    // Within the same type (both regular or both promo), sort by number
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

    // Sort by variant type order: NORMAL → REVERSE_HOLO → POKEBALL → MASTERBALL
    return getVariantSortOrder(a.variant_type) - getVariantSortOrder(b.variant_type);
  });

  return { data: trackerCards, error: null };
}

/**
 * Get cards with variants for a set, filtered by preferences
 * NOTE: This is the old implementation. Use getSetVariantsWithCollection() for better performance.
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

    // Sort by variant type order: NORMAL → REVERSE_HOLO → POKEBALL → MASTERBALL
    return getVariantSortOrder(a.variant_type) - getVariantSortOrder(b.variant_type);
  });

  return { data: cardsWithVariants, error: null };
}
