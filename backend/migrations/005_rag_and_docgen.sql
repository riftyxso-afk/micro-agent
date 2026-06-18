-- RAG + Document Generation tables
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/cxabhgmxdwimhjktzwve/sql/new

-- RAG Documents
CREATE TABLE IF NOT EXISTS rag_documents (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  filename    TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  chunk_count INTEGER DEFAULT 0,
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_documents_user_id ON rag_documents(user_id);

-- RAG Chunks (embedding stored as JSON array, not pgvector)
CREATE TABLE IF NOT EXISTS rag_chunks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  content     TEXT NOT NULL,
  embedding   JSONB,
  chunk_index INTEGER,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document_id ON rag_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_user_id ON rag_chunks(user_id);

-- Generated files registry
CREATE TABLE IF NOT EXISTS generated_files (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  filename    TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  expires_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 minutes',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_files_user_id ON generated_files(user_id);
