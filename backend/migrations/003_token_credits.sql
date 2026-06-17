-- Token Credit System
-- Run this in Supabase SQL Editor to create the required tables.

-- User token balance
CREATE TABLE IF NOT EXISTS user_credits (
  user_id      TEXT PRIMARY KEY,
  balance      INTEGER DEFAULT 0,
  plan         TEXT DEFAULT 'free',   -- 'free' | 'pro' | 'ultra'
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token transaction log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  amount       INTEGER NOT NULL,      -- negative = usage, positive = topup
  type         TEXT NOT NULL,         -- 'usage' | 'topup' | 'bonus' | 'refund' | 'daily_reset'
  model        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Seed free users with 50 tokens (run after users sign up)
-- INSERT INTO user_credits (user_id, balance, plan)
-- VALUES ('your-user-id', 50, 'free')
-- ON CONFLICT (user_id) DO NOTHING;
