"use server";

import { createClient } from "@/lib/supabase/server";
import { withSimpleMultiParamValidation } from "@/lib/server-action-helpers";
import { untrackPromoSchema, restorePromoSchema, resetPromoPreferencesSchema } from "@/lib/validation/tracker";
import { AuthenticationError, mapSupabaseError } from "@/lib/errors";

/**
 * Untrack a specific promo card
 */
export async function untrackPromo(
  promoId: string,
  setId: string
): Promise<{ error: string | null }> {
  return withSimpleMultiParamValidation(
    untrackPromoSchema,
    { promoId, setId },
    async ({ promoId, setId }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
      }

      // Upsert: if exists, set is_tracked=false; if not, create new entry
      const { error } = await supabase.from("user_promo_preferences").upsert(
        {
          user_id: user.id,
          set_id: setId,
          promo_id: promoId,
          is_tracked: false,
        },
        {
          onConflict: "user_id,promo_id",
        }
      );

      if (error) {
        throw mapSupabaseError(error);
      }

      return { error: null };
    }
  );
}

/**
 * Reset promo tracking preferences for a set (delete all untracked entries)
 * This is called when user toggles promos off then on again
 */
export async function resetPromoPreferences(
  setId: string
): Promise<{ error: string | null }> {
  return withSimpleMultiParamValidation(
    resetPromoPreferencesSchema,
    { setId },
    async ({ setId }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
      }

      // Delete all promo preferences for this set and user
      const { error } = await supabase
        .from("user_promo_preferences")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId);

      if (error) {
        throw mapSupabaseError(error);
      }

      return { error: null };
    }
  );
}

/**
 * Restore a single hidden promo
 */
export async function restorePromo(
  promoId: string,
  setId: string
): Promise<{ error: string | null }> {
  return withSimpleMultiParamValidation(
    restorePromoSchema,
    { promoId, setId },
    async ({ promoId, setId }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
      }

      // Delete the preference entry to restore the promo
      const { error } = await supabase
        .from("user_promo_preferences")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("promo_id", promoId);

      if (error) {
        throw mapSupabaseError(error);
      }

      return { error: null };
    }
  );
}
