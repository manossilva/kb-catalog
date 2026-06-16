-- ============================================
-- KB SUPREME — UPDATE V6 (Ordenação de seções)
-- Execute no Supabase SQL Editor
-- ============================================

-- Inicializa sort_order para todas as seções com valores distintos.
-- Seções com sort_order explícito (> 0) mantêm a ordem relativa;
-- seções com sort_order = 0 ou NULL ficam no final, em ordem alfabética.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           ORDER BY
             CASE WHEN sort_order IS NULL OR sort_order = 0
               THEN 999999
               ELSE sort_order
             END,
             name
         ) * 10 AS new_order
  FROM sections
)
UPDATE sections
SET sort_order = ranked.new_order
FROM ranked
WHERE sections.id = ranked.id;
