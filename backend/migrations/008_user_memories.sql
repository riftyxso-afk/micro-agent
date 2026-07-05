-- =============================================
-- MicroAgent Migration 008: User Memories
-- Persistent cross-chat memory for user facts
-- Run in: Supabase Dashboard > SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  source_session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_memories_user ON user_memories(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_memories_user_created ON user_memories(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Users own their memories
CREATE POLICY "users own memories"
  ON user_memories FOR ALL
  USING (auth.uid() = user_id);

-- Realtime (optional, for live updates in settings)
ALTER PUBLICATION supabase_realtime ADD TABLE user_memories;
