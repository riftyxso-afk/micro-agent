CREATE TABLE IF NOT EXISTS promo_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_usage(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_usage_user_code ON promo_usage(user_id, code);
