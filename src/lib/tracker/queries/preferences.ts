"use server";

import { createClient } from "@/lib/supabase/server";
import { TrackerPreferences } from "@/lib/types/tracker";

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
        includePokeball: true,
        includeMasterball: true,
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
        includePokeball: true,
        includeMasterball: true,
      },
      error: null,
    };
  }

  return {
    data: {
      slotConfig: prefs.slot_config,
      includePromos: prefs.include_promos ?? false,
      includeReverseHolos: prefs.include_reverse_holos ?? false,
      includePokeball: prefs.include_pokeball ?? true,
      includeMasterball: prefs.include_masterball ?? true,
    },
    error: null,
  };
}
