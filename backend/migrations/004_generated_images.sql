-- Generated Images table
-- Run this in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS generated_images (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  prompt       TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  storage_path TEXT,
  model        TEXT DEFAULT 'flux-2-klein-4b',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);
