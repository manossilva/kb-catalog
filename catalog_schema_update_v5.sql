-- ============================================
-- KB SUPREME — UPDATE V5 (Visibilidade de cores)
-- Execute no Supabase SQL Editor
-- ============================================

-- Adiciona coluna visible em product_colors
-- true  = cor visível para o usuário final
-- false = cor oculta (admin ainda vê, usuário não)
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
