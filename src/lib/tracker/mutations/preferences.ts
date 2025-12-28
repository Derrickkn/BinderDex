"use server";

import { createClient } from "@/lib/supabase/server";
import { TrackerPreferences } from "@/lib/types/tracker";
import { withSimpleMultiParamValidation } from "@/lib/server-action-helpers";
import { updateTrackerPreferencesSchema } from "@/lib/validation/tracker";
import { AuthenticationError, mapSupabaseError } from "@/lib/errors";

/**
 * Update tracker preferences for a set
 */
export async function updateTrackerPreferences(
  setId: string,
  preferences: Partial<TrackerPreferences>
): Promise<{ error: string | null }> {
  return withSimpleMultiParamValidation(
    updateTrackerPreferencesSchema,
    { setId, preferences },
    async ({ setId, preferences }) => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthenticationError();
      }

      const updateData: Record<string, unknown> = {};
      if (preferences.slotConfig !== undefined) {
        updateData.slot_config = preferences.slotConfig;
      }
      if (preferences.includePromos !== undefined) {
        updateData.include_promos = preferences.includePromos;

        // When user toggles promos ON, reset all promo preferences (re-enable all untracked promos)
        // This allows users to restore previously untracked promos by toggling off and on
        if (preferences.includePromos === true) {
          // Import the function here to avoid circular dependency
          const { resetPromoPreferences } = await import("./promos");
          await resetPromoPreferences(setId);
        }
      }
      if (preferences.includeReverseHolos !== undefined) {
        updateData.include_reverse_holos = preferences.includeReverseHolos;
      }
      if (preferences.includePokeball !== undefined) {
        updateData.include_pokeball = preferences.includePokeball;
      }
      if (preferences.includeMasterball !== undefined) {
        updateData.include_masterball = preferences.includeMasterball;
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
        throw mapSupabaseError(error);
      }

      return { error: null };
    }
  );
}
