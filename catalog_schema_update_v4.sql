-- ============================================
-- KB SUPREME — UPDATE V4 (Proporção por seção)
-- Execute no Supabase SQL Editor
-- ============================================

-- Adiciona coluna ar_ratio na tabela sections
-- NULL = usar padrão automático (square exceto cortinas = tall)
-- Valores possíveis: 'square' (1:1) ou 'tall' (2:3)
ALTER TABLE sections ADD COLUMN IF NOT EXISTS ar_ratio TEXT DEFAULT NULL;
