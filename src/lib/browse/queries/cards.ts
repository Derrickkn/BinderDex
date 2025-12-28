/**
 * Browse Cards - Query Server Actions
 *
 * Server actions for fetching card data for the browse feature.
 */

"use server"

import { createClient } from "@/lib/supabase/server"
import type { BrowseCard } from "@/lib/types/browse"
import type { ServerActionResponse } from "@/lib/server-action-helpers"
import { DatabaseError } from "@/lib/errors"

/**
 * Fetches all unique cards with set data for browsing
 *
 * Returns UNIQUE cards only (NO variants) enriched with set information
 * for era, release date, and logo display.
 *
 * @returns All cards with joined set data
 */
export async function getAllCards(): Promise<
  ServerActionResponse<BrowseCard[]>
> {
  try {
    const supabase = await createClient()

    // Query unique cards with set data join
    // Note: This fetches ALL cards for client-side filtering
    const { data: cards, error } = await supabase
      .from("cards")
      .select(
        `
        id,
        set_id,
        name,
        number,
        rarity,
        supertype,
        subtypes,
        types,
        hp,
        artist,
        national_dex_numbers,
        image_small,
        image_large,
        is_promo,
        is_premium,
        is_legendary,
        is_mythical,
        generation,
        sets!inner(
          id,
          name,
          era,
          series,
          release_date,
          logo_url,
          total
        )
      `
      )
      .order("number", { ascending: true })
      .limit(5000) // Safety limit (current: ~4,108 cards)

    if (error) {
      console.error("Failed to fetch cards:", error)
      throw new DatabaseError(error.message)
    }

    if (!cards) {
      return { data: [], error: null }
    }

    return { data: cards as BrowseCard[], error: null }
  } catch (err) {
    console.error("Error in getAllCards:", err)

    if (err instanceof DatabaseError) {
      return { data: null, error: err.userMessage || "Database error occurred" }
    }

    return {
      data: null,
      error: "Failed to load cards. Please try again.",
    }
  }
}
