-- RLS Policies for Master Set Tracker
-- Run this in the Supabase SQL Editor

-- Enable RLS on user_collections
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- user_collections policies
CREATE POLICY "Users can view own collection entries"
  ON user_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collection entries"
  ON user_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collection entries"
  ON user_collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collection entries"
  ON user_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on master_set_preferences
ALTER TABLE master_set_preferences ENABLE ROW LEVEL SECURITY;

-- master_set_preferences policies
CREATE POLICY "Users can view own preferences"
  ON master_set_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON master_set_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON master_set_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read access for sets, cards, and card_variants (no RLS needed - already public)
-- These tables contain public card data that all users can view
