-- Migration 011: Security Hardening — RLS on all tables
-- Run in Supabase Dashboard > SQL Editor

-- 003: user_credits
DO $$ BEGIN
  ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own credits" ON user_credits FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 003: credit_transactions
DO $$ BEGIN
  ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own transactions" ON credit_transactions FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 004: generated_images
DO $$ BEGIN
  ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own images" ON generated_images FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 005: rag_documents
DO $$ BEGIN
  ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own rag docs" ON rag_documents FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 005: rag_chunks
DO $$ BEGIN
  ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own rag chunks" ON rag_chunks FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 005: generated_files
DO $$ BEGIN
  ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own gen files" ON generated_files FOR ALL USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 006: promo_usage
DO $$ BEGIN
  ALTER TABLE promo_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own promo usage" ON promo_usage FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 007: projects
DO $$ BEGIN
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own projects" ON projects FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 007: project_messages
DO $$ BEGIN
  ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own project messages" ON project_messages FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
