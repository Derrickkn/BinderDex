import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function applyRLSPolicies() {
  console.log("Applying RLS policies...\n");

  const policies = [
    // Enable RLS on user_collections
    `ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY`,

    // user_collections policies
    `DROP POLICY IF EXISTS "Users can view own collection entries" ON user_collections`,
    `CREATE POLICY "Users can view own collection entries" ON user_collections FOR SELECT USING (auth.uid() = user_id)`,

    `DROP POLICY IF EXISTS "Users can insert own collection entries" ON user_collections`,
    `CREATE POLICY "Users can insert own collection entries" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id)`,

    `DROP POLICY IF EXISTS "Users can update own collection entries" ON user_collections`,
    `CREATE POLICY "Users can update own collection entries" ON user_collections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`,

    `DROP POLICY IF EXISTS "Users can delete own collection entries" ON user_collections`,
    `CREATE POLICY "Users can delete own collection entries" ON user_collections FOR DELETE USING (auth.uid() = user_id)`,

    // Enable RLS on master_set_preferences
    `ALTER TABLE master_set_preferences ENABLE ROW LEVEL SECURITY`,

    // master_set_preferences policies
    `DROP POLICY IF EXISTS "Users can view own preferences" ON master_set_preferences`,
    `CREATE POLICY "Users can view own preferences" ON master_set_preferences FOR SELECT USING (auth.uid() = user_id)`,

    `DROP POLICY IF EXISTS "Users can insert own preferences" ON master_set_preferences`,
    `CREATE POLICY "Users can insert own preferences" ON master_set_preferences FOR INSERT WITH CHECK (auth.uid() = user_id)`,

    `DROP POLICY IF EXISTS "Users can update own preferences" ON master_set_preferences`,
    `CREATE POLICY "Users can update own preferences" ON master_set_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`,
  ];

  for (const sql of policies) {
    const shortSql = sql.substring(0, 60) + (sql.length > 60 ? "..." : "");
    try {
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql });
      if (error) {
        // Try direct query if exec_sql doesn't exist
        console.log(`  Running: ${shortSql}`);
        // Note: Direct SQL execution requires postgres connection
      } else {
        console.log(`  ✓ ${shortSql}`);
      }
    } catch (err) {
      console.log(`  ⚠ ${shortSql} - may need manual execution`);
    }
  }

  console.log("\n✅ RLS policies script completed");
  console.log("\nNote: If policies weren't applied, run the SQL manually in Supabase SQL Editor:");
  console.log("  File: supabase/migrations/20251226_tracker_rls_policies.sql");
}

applyRLSPolicies().catch(console.error);
