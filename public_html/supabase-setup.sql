-- ============================================
-- GANTE — Script de Criacao das Tabelas no Supabase
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gelato', 'chocolate')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PRODUTOS (gelatos, chocolates, diversos)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT NULL,
  type TEXT NOT NULL CHECK (type IN ('gelato', 'chocolate', 'diversos')),
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE TAMANHOS DE GELATO
CREATE TABLE IF NOT EXISTS gelato_sizes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balls INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE COBERTURAS
CREATE TABLE IF NOT EXISTS toppings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE CAIXAS DE CHOCOLATE
CREATE TABLE IF NOT EXISTS chocolate_boxes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POLITICAS RLS (Row Level Security)
-- Permitir leitura publica e escrita publica
-- (protegido pela senha do admin no frontend)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gelato_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chocolate_boxes ENABLE ROW LEVEL SECURITY;

-- Politicas de SELECT (leitura publica)
CREATE POLICY "Permitir leitura publica" ON categories FOR SELECT USING (true);
CREATE POLICY "Permitir leitura publica" ON products FOR SELECT USING (true);
CREATE POLICY "Permitir leitura publica" ON gelato_sizes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura publica" ON toppings FOR SELECT USING (true);
CREATE POLICY "Permitir leitura publica" ON chocolate_boxes FOR SELECT USING (true);

-- Politicas de INSERT (escrita publica - admin protegido por senha no frontend)
CREATE POLICY "Permitir insert publico" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insert publico" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insert publico" ON gelato_sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insert publico" ON toppings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insert publico" ON chocolate_boxes FOR INSERT WITH CHECK (true);

-- Politicas de UPDATE (escrita publica)
CREATE POLICY "Permitir update publico" ON categories FOR UPDATE USING (true);
CREATE POLICY "Permitir update publico" ON products FOR UPDATE USING (true);
CREATE POLICY "Permitir update publico" ON gelato_sizes FOR UPDATE USING (true);
CREATE POLICY "Permitir update publico" ON toppings FOR UPDATE USING (true);
CREATE POLICY "Permitir update publico" ON chocolate_boxes FOR UPDATE USING (true);

-- Politicas de DELETE (escrita publica)
CREATE POLICY "Permitir delete publico" ON categories FOR DELETE USING (true);
CREATE POLICY "Permitir delete publico" ON products FOR DELETE USING (true);
CREATE POLICY "Permitir delete publico" ON gelato_sizes FOR DELETE USING (true);
CREATE POLICY "Permitir delete publico" ON toppings FOR DELETE USING (true);
CREATE POLICY "Permitir delete publico" ON chocolate_boxes FOR DELETE USING (true);

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Categorias de Gelato
INSERT INTO categories (id, name, type) VALUES
  ('classicos', 'Classicos Italianos', 'gelato'),
  ('especiais', 'Especiais da Casa', 'gelato'),
  ('limitada', 'Edicao Limitada', 'gelato')
ON CONFLICT (id) DO NOTHING;

-- Categorias de Chocolate
INSERT INTO categories (id, name, type) VALUES
  ('trufas', 'Trufas & Bombons', 'chocolate'),
  ('barras', 'Barras Artesanais', 'chocolate'),
  ('drageas', 'Drageas & Especiais', 'chocolate'),
  ('sazonais', 'Sazonais', 'chocolate')
ON CONFLICT (id) DO NOTHING;

-- Gelatos
INSERT INTO products (id, name, description, price, category, type, image_url) VALUES
  ('g1', 'Stracciatella', 'Cremoso gelato de baunilha com lascas finas de chocolate amargo italiano.', 16.00, 'classicos', 'gelato', ''),
  ('g2', 'Pistacchio', 'Pistache siciliano torrado, intenso e aveludado, receita tradicional de Bronte.', 18.00, 'classicos', 'gelato', ''),
  ('g3', 'Fior di Latte', 'A pureza do leite fresco em sua forma mais elegante, suave e delicado.', 14.00, 'classicos', 'gelato', ''),
  ('g4', 'Cioccolato Fondente', 'Chocolate belga 70% cacau, intenso e encorpado, para verdadeiros apreciadores.', 16.00, 'classicos', 'gelato', ''),
  ('g5', 'Nocciola', 'Avela piemontesa tostada, sabor profundo e textura irresistivelmente cremosa.', 18.00, 'classicos', 'gelato', ''),
  ('g6', 'Limone', 'Sorbetto refrescante de limao siciliano, acidez equilibrada e aroma vibrante.', 14.00, 'classicos', 'gelato', ''),
  ('g7', 'Amarena', 'Gelato de creme com cerejas amarena italianas e calda artesanal.', 16.00, 'classicos', 'gelato', ''),
  ('g8', 'Doce de Leite com Nozes', 'Doce de leite argentino cremoso com nozes pecas caramelizadas.', 18.00, 'especiais', 'gelato', ''),
  ('g9', 'Acai com Granola', 'Acai do Para com granola crocante e mel organico, sabor brasileiro.', 20.00, 'especiais', 'gelato', ''),
  ('g10', 'Brigadeiro', 'O classico brasileiro em gelato: chocolate ao leite, cacau e granulado.', 18.00, 'especiais', 'gelato', ''),
  ('g11', 'Maracuja', 'Sorbetto tropical de maracuja, intenso, cremoso e refrescante.', 16.00, 'especiais', 'gelato', ''),
  ('g12', 'Cafe Espresso', 'Cafe especial brasileiro em gelato, notas de caramelo e torra media.', 16.00, 'especiais', 'gelato', ''),
  ('g13', 'Coco Queimado', 'Coco fresco tostado com notas de caramelo, textura rica e tropical.', 16.00, 'especiais', 'gelato', ''),
  ('g14', 'Panettone', 'Sabor natalino com frutas cristalizadas, baunilha e gotas de chocolate.', 22.00, 'limitada', 'gelato', ''),
  ('g15', 'Tiramisu', 'Mascarpone, cafe espresso, biscoito champagne e cacau, a sobremesa italiana.', 22.00, 'limitada', 'gelato', ''),
  ('g16', 'Frutas Vermelhas', 'Mix de morango, framboesa e mirtilo com coulis artesanal.', 20.00, 'limitada', 'gelato', ''),
  ('g17', 'Pistache com Framboesa', 'Combinacao ousada de pistache tostado com coulis de framboesa fresca.', 24.00, 'limitada', 'gelato', '')
ON CONFLICT (id) DO NOTHING;

-- Chocolates
INSERT INTO products (id, name, description, price, category, type, image_url) VALUES
  ('c1', 'Trufa de Champagne', 'Ganache de champagne frances envolta em chocolate belga 54%.', 8.50, 'trufas', 'chocolate', ''),
  ('c2', 'Bombom de Pistache', 'Recheio cremoso de pistache siciliano em casca de chocolate ao leite.', 9.00, 'trufas', 'chocolate', ''),
  ('c3', 'Trufa de Maracuja', 'Ganache de maracuja fresco com chocolate branco e toque de pimenta rosa.', 8.50, 'trufas', 'chocolate', ''),
  ('c4', 'Bombom de Avela', 'Avela piemontesa inteira coberta com praline e chocolate amargo.', 9.50, 'trufas', 'chocolate', ''),
  ('c5', 'Trufa de Cafe', 'Ganache de cafe especial com cobertura de cacau em po holandes.', 8.00, 'trufas', 'chocolate', ''),
  ('c6', 'Bombom de Caramelo Salgado', 'Caramelo com flor de sal em chocolate ao leite 45% cacau.', 9.00, 'trufas', 'chocolate', ''),
  ('c7', 'Barra 70% Cacau Origem', 'Chocolate single-origin da Bahia, notas frutadas e torra suave. 80g.', 28.00, 'barras', 'chocolate', ''),
  ('c8', 'Barra ao Leite com Caramelo', 'Chocolate ao leite 45% com camada de caramelo crocante. 80g.', 26.00, 'barras', 'chocolate', ''),
  ('c9', 'Barra Branca com Matcha', 'Chocolate branco premium com matcha japones ceremonial. 80g.', 30.00, 'barras', 'chocolate', ''),
  ('c10', 'Barra Ruby', 'Chocolate ruby com notas naturais de frutas vermelhas. 80g.', 32.00, 'barras', 'chocolate', ''),
  ('c11', 'Barra Amargo com Laranja', 'Chocolate 60% com raspas de laranja cristalizadas e especiarias. 80g.', 28.00, 'barras', 'chocolate', ''),
  ('c12', 'Drageas de Amendoa', 'Amendoas torradas cobertas com chocolate ao leite belga. 150g.', 22.00, 'drageas', 'chocolate', ''),
  ('c13', 'Drageas de Damasco', 'Damascos turcos cobertos com chocolate amargo. 150g.', 24.00, 'drageas', 'chocolate', ''),
  ('c14', 'Nibs de Cacau Caramelizado', 'Nibs de cacau da Bahia caramelizados com acucar demerara. 100g.', 18.00, 'drageas', 'chocolate', ''),
  ('c15', 'Mix Nuts Chocolate', 'Selecao de castanhas nobres cobertas com chocolate 54%. 200g.', 35.00, 'drageas', 'chocolate', ''),
  ('c16', 'Ovo de Pascoa Classico', 'Chocolate ao leite 45% com recheio de ganache trufado. 250g.', 65.00, 'sazonais', 'chocolate', ''),
  ('c17', 'Caixa Natalina', 'Selecao especial de 12 bombons sortidos em caixa presenteavel.', 78.00, 'sazonais', 'chocolate', ''),
  ('c18', 'Coracao de Chocolate', 'Coracao de chocolate ruby com recheio de frutas vermelhas. 180g.', 45.00, 'sazonais', 'chocolate', '')
ON CONFLICT (id) DO NOTHING;

-- Diversos
INSERT INTO products (id, name, description, price, category, type, image_url) VALUES
  ('d1', 'Casquinha Simples', 'Casquinha crocante para acompanhar seu gelato.', 3.00, NULL, 'diversos', ''),
  ('d2', 'Casquinha Coberta', 'Casquinha com cobertura de chocolate belga.', 5.00, NULL, 'diversos', ''),
  ('d3', 'Agua Mineral', 'Agua mineral sem gas 500ml.', 4.00, NULL, 'diversos', ''),
  ('d4', 'Agua com Gas', 'Agua mineral com gas 500ml.', 5.00, NULL, 'diversos', ''),
  ('d5', 'Suco Natural', 'Suco natural da fruta do dia 300ml.', 10.00, NULL, 'diversos', ''),
  ('d6', 'Cafe Espresso', 'Cafe espresso curto ou longo.', 6.00, NULL, 'diversos', ''),
  ('d7', 'Cappuccino', 'Cappuccino italiano com espuma cremosa.', 10.00, NULL, 'diversos', ''),
  ('d8', 'Milkshake', 'Milkshake cremoso com o sabor de gelato da sua escolha.', 18.00, NULL, 'diversos', ''),
  ('d9', 'Affogato', 'Gelato de fior di latte com shot de cafe espresso.', 16.00, NULL, 'diversos', ''),
  ('d10', 'Brownie', 'Brownie artesanal de chocolate belga.', 12.00, NULL, 'diversos', '')
ON CONFLICT (id) DO NOTHING;

-- Tamanhos de Gelato
INSERT INTO gelato_sizes (id, name, balls, price, sort_order) VALUES
  ('pequeno', 'Pequeno', 1, 10.00, 1),
  ('medio', 'Medio', 2, 16.00, 2),
  ('grande', 'Grande', 3, 22.00, 3),
  ('240ml', '240 Ml', 2, 14.00, 4),
  ('500ml', '500 Ml', 3, 22.00, 5),
  ('600g', '600 Gramas', 4, 28.00, 6),
  ('1kg', '1 Kg', 6, 45.00, 7)
ON CONFLICT (id) DO NOTHING;

-- Coberturas
INSERT INTO toppings (id, name, price) VALUES
  ('t1', 'Calda de Chocolate', 3.00),
  ('t2', 'Calda de Caramelo', 3.00),
  ('t3', 'Frutas Frescas', 4.00),
  ('t4', 'Granola', 3.00),
  ('t5', 'Chantilly', 2.50),
  ('t6', 'Castanhas Trituradas', 4.00)
ON CONFLICT (id) DO NOTHING;

-- Caixas de Chocolate
INSERT INTO chocolate_boxes (id, name, units, price) VALUES
  ('box6', 'Caixa Pequena', 6, 48.00),
  ('box12', 'Caixa Media', 12, 89.00),
  ('box24', 'Caixa Grande', 24, 165.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRONTO! As tabelas e dados iniciais foram criados.
-- Agora configure a URL e anon key no supabase-config.js
-- ============================================
