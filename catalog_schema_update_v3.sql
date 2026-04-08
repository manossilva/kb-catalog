-- ============================================
-- KB SUPREME — UPDATE V3 (Estampas/Patterns)
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Torna hex_color opcional (necessário para estampas que não têm cor hex)
ALTER TABLE product_colors ALTER COLUMN hex_color DROP NOT NULL;

-- 2. Adiciona coluna pattern_url (caso não exista ainda)
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS pattern_url TEXT;

-- 3. Cria bucket de armazenamento para estampas (ignora se já existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('patterns', 'patterns', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Políticas de storage (remove antes para evitar conflito, depois recria)
DROP POLICY IF EXISTS "Public read patterns"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload patterns"  ON storage.objects;
DROP POLICY IF EXISTS "Auth update patterns"  ON storage.objects;
DROP POLICY IF EXISTS "Auth delete patterns"  ON storage.objects;

-- Leitura pública das imagens de estampa
CREATE POLICY "Public read patterns"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patterns');

-- Upload somente para admins autenticados
CREATE POLICY "Auth upload patterns"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patterns' AND auth.role() = 'authenticated');

-- Atualização somente para admins autenticados
CREATE POLICY "Auth update patterns"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'patterns' AND auth.role() = 'authenticated');

-- Exclusão somente para admins autenticados
CREATE POLICY "Auth delete patterns"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patterns' AND auth.role() = 'authenticated');


-- ============================================
-- UPDATE V3.1 — Visibilidade de produtos
-- ============================================

-- Adiciona coluna visible (padrão: visível para todos)
ALTER TABLE products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;


-- ============================================
-- UPDATE V3.2 — Imagem por cor/estampa
-- ============================================

-- Foto do produto em cada cor/estampa (obrigatória para troca de imagem ao clicar)
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS image_url TEXT;
