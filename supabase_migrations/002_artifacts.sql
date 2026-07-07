-- =============================================
-- MicroAgent Artifacts Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Artifacts — identity of each file created by AI
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  message_id UUID,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'text',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Artifact versions — each write/edit/execute creates a new version
CREATE TABLE IF NOT EXISTS artifact_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  content TEXT,
  storage_path TEXT,
  created_by_tool TEXT NOT NULL DEFAULT 'write_file',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_chat ON artifacts(chat_id);
CREATE INDEX IF NOT EXISTS idx_artifact_versions_artifact ON artifact_versions(artifact_id, version_number);

-- 3. Row Level Security
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_versions ENABLE ROW LEVEL SECURITY;

-- Artifacts: user owns via session ownership
CREATE POLICY "users own artifacts"
  ON artifacts FOR ALL
  USING (
    chat_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Artifact versions: via artifact ownership
CREATE POLICY "users own artifact versions"
  ON artifact_versions FOR ALL
  USING (
    artifact_id IN (
      SELECT a.id FROM artifacts a
      JOIN sessions s ON a.chat_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );
