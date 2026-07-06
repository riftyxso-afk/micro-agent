-- Migration 009: Onboarding & Survey
-- Run in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS onboarding_responses (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  primary_goal TEXT,
  ai_familiarity TEXT,
  language_preference TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  skipped BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 10),
  most_used_feature TEXT,
  pain_points TEXT,
  feature_requests TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Track survey dismissal per user
CREATE TABLE IF NOT EXISTS survey_dismissals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own onboarding" ON onboarding_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own survey" ON survey_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own dismissal" ON survey_dismissals FOR ALL USING (auth.uid() = user_id);
