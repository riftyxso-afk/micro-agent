-- Migration 010: Response Comparison (A/B testing)
-- Run in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS response_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),
  user_message TEXT NOT NULL,
  variant_type TEXT NOT NULL DEFAULT 'model_ab',
  response_a_source TEXT NOT NULL,
  response_a_content TEXT NOT NULL DEFAULT '',
  response_b_source TEXT NOT NULL,
  response_b_content TEXT NOT NULL DEFAULT '',
  chosen TEXT CHECK (chosen IN ('a', 'b', 'both_good', 'both_bad') OR chosen IS NULL),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE response_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own comparisons" ON response_comparisons FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_response_comparisons_user ON response_comparisons(user_id);
