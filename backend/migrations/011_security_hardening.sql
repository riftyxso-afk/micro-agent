-- Migration 011: Security Hardening — RLS on all tables
-- Run in Supabase Dashboard > SQL Editor

-- 003: token_credits, credit_transactions
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own credits" ON user_credits FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "users own transactions" ON credit_transactions FOR ALL USING (user_id = auth.uid()::text);

-- 004: generated_images
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own images" ON generated_images FOR ALL USING (user_id = auth.uid()::text);

-- 005: rag_documents, rag_chunks, generated_files
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own rag docs" ON rag_documents FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "users own rag chunks" ON rag_chunks FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "users own gen files" ON generated_files FOR ALL USING (user_id = auth.uid()::text);

-- 006: promo_usage (already has RLS but double-check)
DO $$ BEGIN
  ALTER TABLE promo_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "users own promo usage" ON promo_usage FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 007: projects, project_messages
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own projects" ON projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users own project messages" ON project_messages FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Note: sessions, messages, skill_installs, subscriptions already have RLS from original schema
-- Verify with: SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN (
--   SELECT tablename FROM pg_tables t JOIN pg_policies p ON t.tablename = p.tablename WHERE t.schemaname='public'
-- );
