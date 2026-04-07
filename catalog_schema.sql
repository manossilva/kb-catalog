-- ============================================
-- KB SUPREME - CATÁLOGO DIGITAL
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Tabela de categorias/seções
CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela principal de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  composition TEXT DEFAULT '100% Poliéster',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tamanhos e referências por produto
-- type: 'solteiro', 'casal', 'queen', 'king', etc.
CREATE TABLE product_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_type TEXT NOT NULL,
  reference TEXT NOT NULL,
  quantity INT DEFAULT 0,
  dimensions JSONB DEFAULT '{}',
  -- dimensions ex: {"altura":"2,30","largura":"1,00","braco":"0,80x0,40"}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Cores disponíveis por produto
CREATE TABLE product_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  hex_color TEXT NOT NULL,
  -- hex_color ex: "#F5F0E1"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Índices
CREATE INDEX idx_products_section ON products(section_id);
CREATE INDEX idx_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_colors_product ON product_colors(product_id);

-- 6. RLS (Row Level Security)
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;

-- Leitura pública (catálogo aberto)
CREATE POLICY "Public read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read colors" ON product_colors FOR SELECT USING (true);

-- Escrita somente para usuários autenticados
CREATE POLICY "Auth insert sections" ON sections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update sections" ON sections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete sections" ON sections FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert sizes" ON product_sizes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update sizes" ON product_sizes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete sizes" ON product_sizes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert colors" ON product_colors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update colors" ON product_colors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete colors" ON product_colors FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Dados iniciais de seções
INSERT INTO sections (name, slug, sort_order) VALUES
  ('Protetor para Sofá', 'protetor-sofa', 1),
  ('Cama', 'cama', 2),
  ('Mesa', 'mesa', 3),
  ('Banho', 'banho', 4);

-- 8. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
