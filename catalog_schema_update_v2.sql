-- ============================================
-- KB SUPREME — UPDATE V2
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Adiciona coluna pattern_url em product_colors
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS pattern_url TEXT;

-- 2. Cria bucket de armazenamento para estampas
INSERT INTO storage.buckets (id, name, public)
VALUES ('patterns', 'patterns', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de storage
-- Leitura pública
CREATE POLICY "Public read patterns"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patterns');

-- Upload somente autenticados
CREATE POLICY "Auth upload patterns"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patterns' AND auth.role() = 'authenticated');

-- Atualizar somente autenticados
CREATE POLICY "Auth update patterns"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'patterns' AND auth.role() = 'authenticated');

-- Deletar somente autenticados
CREATE POLICY "Auth delete patterns"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patterns' AND auth.role() = 'authenticated');
