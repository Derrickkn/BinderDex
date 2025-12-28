"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionEntryUpdate } from "@/lib/types/tracker";
import { withMultiParamValidation, withSimpleMultiParamValidation } from "@/lib/server-action-helpers";
import { toggleCardOwnedSchema, updateCollectionEntrySchema } from "@/lib/validation/tracker";
import { AuthenticationError, mapSupabaseError } from "@/lib/errors";

/**
 * Toggle card owned status (quick toggle)
 */
export async function toggleCardOwned(variantId: string): Promise<{
  data: { owned: boolean; quantity: number } | null;
  error: string | null;
}> {
  return withMultiParamValidation(
    toggleCardOwnedSchema,
    { variantId },
    async ({ variantId }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
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
          throw mapSupabaseError(error);
        }

        return { data: { owned: false, quantity: 0 }, error: null };
      } else if (existing) {
        // Mark as owned
        const { error } = await supabase
          .from("user_collections")
          .update({ quantity: 1 })
          .eq("id", existing.id);

        if (error) {
          throw mapSupabaseError(error);
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
          throw mapSupabaseError(error);
        }

        return { data: { owned: true, quantity: 1 }, error: null };
      }
    }
  );
}

/**
 * Update collection entry (full edit from modal)
 */
export async function updateCollectionEntry(
  variantId: string,
  data: CollectionEntryUpdate
): Promise<{ error: string | null }> {
  return withSimpleMultiParamValidation(
    updateCollectionEntrySchema,
    { variantId, data },
    async ({ variantId, data }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
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
          throw mapSupabaseError(error);
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
          throw mapSupabaseError(error);
        }
      }

      return { error: null };
    }
  );
}
