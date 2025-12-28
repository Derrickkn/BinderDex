"use server";

import { createClient } from "@/lib/supabase/server";
import { TrackerCard } from "@/lib/types/tracker";

/**
 * Get user's collection entries for a set
 * OPTIMIZED: Filters by set at database level instead of client-side
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

  // PERFORMANCE FIX: Filter by set_id at database level using WHERE clause
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
    .eq("user_id", user.id)
    .eq("card_variants.cards.set_id", setId); // ✅ Database-level filtering

  if (error) {
    return { data: null, error: error.message };
  }

  // Create a map by variant_id
  const collectionMap = new Map<string, TrackerCard>();

  for (const entry of collection) {
    collectionMap.set(entry.variant_id, {
      owned: entry.quantity > 0,
      quantity: entry.quantity,
      condition: entry.condition,
      notes: entry.notes,
      acquired_date: entry.acquired_date,
      collection_id: entry.id,
    } as unknown as TrackerCard);
  }

  return { data: collectionMap, error: null };
}
