"use server";

import { createClient } from "@/lib/supabase/server";
import { TrackerCard } from "@/lib/types/tracker";

/**
 * Get count of hidden promos for a set
 */
export async function getHiddenPromoCount(
  setId: string
): Promise<{ data: number | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: 0, error: null };
  }

  const { error, count } = await supabase
    .from("user_promo_preferences")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("set_id", setId)
    .eq("is_tracked", false);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: count || 0, error: null };
}

/**
 * Get hidden promo cards for a set
 */
export async function getHiddenPromos(
  setId: string
): Promise<{ data: TrackerCard[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  // Get hidden promo IDs
  const { data: hiddenPrefs, error: prefsError } = await supabase
    .from("user_promo_preferences")
    .select("promo_id")
    .eq("user_id", user.id)
    .eq("set_id", setId)
    .eq("is_tracked", false);

  if (prefsError) {
    return { data: null, error: prefsError.message };
  }

  if (!hiddenPrefs || hiddenPrefs.length === 0) {
    return { data: [], error: null };
  }

  const hiddenPromoIds = hiddenPrefs.map((p) => p.promo_id);

  // Fetch the actual promo cards from promo_cards table
  const { data: promos, error: promosError } = await supabase
    .from("promo_cards")
    .select(`
      id,
      card_name,
      promo_number,
      card_type,
      product_source,
      is_pokemon_center_exclusive,
      image_small,
      image_large,
      created_at,
      updated_at
    `)
    .eq("set_id", setId)
    .in("id", hiddenPromoIds);

  if (promosError) {
    return { data: null, error: promosError.message };
  }

  if (!promos) {
    return { data: [], error: null };
  }

  // For promo cards, we need to find the corresponding card_variants entry
  // Promos are stored in the cards table with is_promo=true, and their variants are in card_variants
  // The promo_number in promo_cards matches the card.number in cards table

  // Get all promo cards from the cards table to find their variant IDs
  const promoNumbers = promos.map((p) => p.promo_number);
  const { data: cardData } = await supabase
    .from("cards")
    .select(`
      id,
      number,
      card_variants!inner(id, variant_type)
    `)
    .eq("set_id", setId)
    .eq("is_promo", true)
    .in("number", promoNumbers);

  // Map promo_number to variant_id (NORMAL variant)
  const promoNumberToVariantId = new Map<string, string>();
  if (cardData) {
    for (const card of cardData) {
      const variants = card.card_variants as unknown as Array<{ id: string; variant_type: string }>;
      const normalVariant = variants.find((v) => v.variant_type === "NORMAL");
      if (normalVariant) {
        promoNumberToVariantId.set(card.number, normalVariant.id);
      }
    }
  }

  // Get user's collection for these promo variants
  const variantIds = Array.from(promoNumberToVariantId.values());
  const { data: collectionEntries } = await supabase
    .from("user_collections")
    .select("variant_id, quantity, condition, notes, acquired_date, id")
    .eq("user_id", user.id)
    .in("variant_id", variantIds.length > 0 ? variantIds : ["00000000-0000-0000-0000-000000000000"]);

  const collectionMap = new Map(
    (collectionEntries || []).map((entry) => [entry.variant_id, entry])
  );

  // Map to TrackerCard format
  const trackerCards: TrackerCard[] = promos.map((promo) => {
    // Get the actual variant_id from the cards table mapping
    const variantId = promoNumberToVariantId.get(promo.promo_number) || `${promo.id}-NORMAL`;
    const collection = collectionMap.get(variantId);
    const imageUrl = promo.image_large || promo.image_small;

    return {
      // Card base fields (from Card type)
      id: `promo-${promo.id}`,
      created_at: promo.created_at,
      updated_at: promo.updated_at,
      national_dex_numbers: [],
      name: promo.card_name,
      number: promo.promo_number,
      rarity: "Promo",
      image_small: promo.image_small,
      image_large: promo.image_large,
      supertype: "Pokémon",
      subtypes: [],
      types: promo.card_type ? [promo.card_type] : [],
      hp: null,
      artist: null,
      set_id: setId,
      is_promo: true,
      is_premium: false,
      is_legendary: false,
      is_mythical: false,
      generation: null,
      // Variant fields
      variant_id: variantId,
      variant_type: "NORMAL" as const,
      variant_image_url: imageUrl,
      // Collection fields
      owned: !!collection && collection.quantity > 0,
      quantity: collection?.quantity || 0,
      condition: collection?.condition || null,
      notes: collection?.notes || null,
      acquired_date: collection?.acquired_date || null,
      collection_id: collection?.id || null,
      // Promo-specific fields
      promo_id: promo.id,
      promo_number: promo.promo_number,
      promo_product_source: promo.product_source,
      is_promo_untracked: true, // These are hidden
      is_pokemon_center_exclusive: promo.is_pokemon_center_exclusive,
    };
  });

  return { data: trackerCards, error: null };
}
