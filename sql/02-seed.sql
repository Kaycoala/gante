-- ============================================
-- GANTE — Dados Iniciais (Seed)
-- ============================================
-- Execute este script APOS o 01-setup.sql
-- Ele insere todos os produtos, categorias,
-- tamanhos, caixas e coberturas iniciais.
-- ============================================

-- ========== CATEGORIAS DE GELATO ==========
INSERT INTO categories (name, type) VALUES
  ('Classicos Italianos', 'gelato'),
  ('Especiais da Casa', 'gelato'),
  ('Edicao Limitada', 'gelato');

-- ========== CATEGORIAS DE CHOCOLATE ==========
INSERT INTO categories (name, type) VALUES
  ('Trufas & Bombons', 'chocolate'),
  ('Barras Artesanais', 'chocolate'),
  ('Drageas & Especiais', 'chocolate'),
  ('Sazonais', 'chocolate');

-- ========== GELATOS ==========
-- Classicos Italianos (category = id da categoria "Classicos Italianos" inserida acima)
-- Usamos subconsulta para pegar o id correto
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Stracciatella', 'Cremoso gelato de baunilha com lascas finas de chocolate amargo italiano.', 16.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Pistacchio', 'Pistache siciliano torrado, intenso e aveludado, receita tradicional de Bronte.', 18.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Fior di Latte', 'A pureza do leite fresco em sua forma mais elegante, suave e delicado.', 14.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Cioccolato Fondente', 'Chocolate belga 70% cacau, intenso e encorpado, para verdadeiros apreciadores.', 16.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Nocciola', 'Avela piemontesa tostada, sabor profundo e textura irresistivelmente cremosa.', 18.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Limone', 'Sorbetto refrescante de limao siciliano, acidez equilibrada e aroma vibrante.', 14.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Amarena', 'Gelato de creme com cerejas amarena italianas e calda artesanal.', 16.00, (SELECT id::text FROM categories WHERE name = 'Classicos Italianos' AND type = 'gelato' LIMIT 1), 'gelato', '');

-- Especiais da Casa
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Doce de Leite com Nozes', 'Doce de leite argentino cremoso com nozes pecas caramelizadas.', 18.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Acai com Granola', 'Acai do Para com granola crocante e mel organico, sabor brasileiro.', 20.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Brigadeiro', 'O classico brasileiro em gelato: chocolate ao leite, cacau e granulado.', 18.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Maracuja', 'Sorbetto tropical de maracuja, intenso, cremoso e refrescante.', 16.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Cafe Espresso', 'Cafe especial brasileiro em gelato, notas de caramelo e torra media.', 16.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Coco Queimado', 'Coco fresco tostado com notas de caramelo, textura rica e tropical.', 16.00, (SELECT id::text FROM categories WHERE name = 'Especiais da Casa' AND type = 'gelato' LIMIT 1), 'gelato', '');

-- Edicao Limitada
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Panettone', 'Sabor natalino com frutas cristalizadas, baunilha e gotas de chocolate.', 22.00, (SELECT id::text FROM categories WHERE name = 'Edicao Limitada' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Tiramisu', 'Mascarpone, cafe espresso, biscoito champagne e cacau, a sobremesa italiana.', 22.00, (SELECT id::text FROM categories WHERE name = 'Edicao Limitada' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Frutas Vermelhas', 'Mix de morango, framboesa e mirtilo com coulis artesanal.', 20.00, (SELECT id::text FROM categories WHERE name = 'Edicao Limitada' AND type = 'gelato' LIMIT 1), 'gelato', ''),
  ('Pistache com Framboesa', 'Combinacao ousada de pistache tostado com coulis de framboesa fresca.', 24.00, (SELECT id::text FROM categories WHERE name = 'Edicao Limitada' AND type = 'gelato' LIMIT 1), 'gelato', '');

-- ========== CHOCOLATES ==========
-- Trufas & Bombons
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Trufa de Champagne', 'Ganache de champagne frances envolta em chocolate belga 54%.', 8.50, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Bombom de Pistache', 'Recheio cremoso de pistache siciliano em casca de chocolate ao leite.', 9.00, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Trufa de Maracuja', 'Ganache de maracuja fresco com chocolate branco e toque de pimenta rosa.', 8.50, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Bombom de Avela', 'Avela piemontesa inteira coberta com praline e chocolate amargo.', 9.50, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Trufa de Cafe', 'Ganache de cafe especial com cobertura de cacau em po holandes.', 8.00, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Bombom de Caramelo Salgado', 'Caramelo com flor de sal em chocolate ao leite 45% cacau.', 9.00, (SELECT id::text FROM categories WHERE name = 'Trufas & Bombons' AND type = 'chocolate' LIMIT 1), 'chocolate', '');

-- Barras Artesanais
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Barra 70% Cacau Origem', 'Chocolate single-origin da Bahia, notas frutadas e torra suave. 80g.', 28.00, (SELECT id::text FROM categories WHERE name = 'Barras Artesanais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Barra ao Leite com Caramelo', 'Chocolate ao leite 45% com camada de caramelo crocante. 80g.', 26.00, (SELECT id::text FROM categories WHERE name = 'Barras Artesanais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Barra Branca com Matcha', 'Chocolate branco premium com matcha japones ceremonial. 80g.', 30.00, (SELECT id::text FROM categories WHERE name = 'Barras Artesanais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Barra Ruby', 'Chocolate ruby com notas naturais de frutas vermelhas. 80g.', 32.00, (SELECT id::text FROM categories WHERE name = 'Barras Artesanais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Barra Amargo com Laranja', 'Chocolate 60% com raspas de laranja cristalizadas e especiarias. 80g.', 28.00, (SELECT id::text FROM categories WHERE name = 'Barras Artesanais' AND type = 'chocolate' LIMIT 1), 'chocolate', '');

-- Drageas & Especiais
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Drageas de Amendoa', 'Amendoas torradas cobertas com chocolate ao leite belga. 150g.', 22.00, (SELECT id::text FROM categories WHERE name = 'Drageas & Especiais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Drageas de Damasco', 'Damascos turcos cobertos com chocolate amargo. 150g.', 24.00, (SELECT id::text FROM categories WHERE name = 'Drageas & Especiais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Nibs de Cacau Caramelizado', 'Nibs de cacau da Bahia caramelizados com acucar demerara. 100g.', 18.00, (SELECT id::text FROM categories WHERE name = 'Drageas & Especiais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Mix Nuts Chocolate', 'Selecao de castanhas nobres cobertas com chocolate 54%. 200g.', 35.00, (SELECT id::text FROM categories WHERE name = 'Drageas & Especiais' AND type = 'chocolate' LIMIT 1), 'chocolate', '');

-- Sazonais
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Ovo de Pascoa Classico', 'Chocolate ao leite 45% com recheio de ganache trufado. 250g.', 65.00, (SELECT id::text FROM categories WHERE name = 'Sazonais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Caixa Natalina', 'Selecao especial de 12 bombons sortidos em caixa presenteavel.', 78.00, (SELECT id::text FROM categories WHERE name = 'Sazonais' AND type = 'chocolate' LIMIT 1), 'chocolate', ''),
  ('Coracao de Chocolate', 'Coracao de chocolate ruby com recheio de frutas vermelhas. 180g.', 45.00, (SELECT id::text FROM categories WHERE name = 'Sazonais' AND type = 'chocolate' LIMIT 1), 'chocolate', '');

-- ========== DIVERSOS ==========
INSERT INTO products (name, description, price, category, type, image_url) VALUES
  ('Casquinha Simples', 'Casquinha crocante para acompanhar seu gelato.', 3.00, NULL, 'diversos', ''),
  ('Casquinha Coberta', 'Casquinha com cobertura de chocolate belga.', 5.00, NULL, 'diversos', ''),
  ('Agua Mineral', 'Agua mineral sem gas 500ml.', 4.00, NULL, 'diversos', ''),
  ('Agua com Gas', 'Agua mineral com gas 500ml.', 5.00, NULL, 'diversos', ''),
  ('Suco Natural', 'Suco natural da fruta do dia 300ml.', 10.00, NULL, 'diversos', ''),
  ('Cafe Espresso', 'Cafe espresso curto ou longo.', 6.00, NULL, 'diversos', ''),
  ('Cappuccino', 'Cappuccino italiano com espuma cremosa.', 10.00, NULL, 'diversos', ''),
  ('Milkshake', 'Milkshake cremoso com o sabor de gelato da sua escolha.', 18.00, NULL, 'diversos', ''),
  ('Affogato', 'Gelato de fior di latte com shot de cafe espresso.', 16.00, NULL, 'diversos', ''),
  ('Brownie', 'Brownie artesanal de chocolate belga.', 12.00, NULL, 'diversos', '');

-- ========== TAMANHOS DE GELATO ==========
INSERT INTO gelato_sizes (id, name, balls, price) VALUES
  ('pequeno', 'Pequeno', 1, 10.00),
  ('medio', 'Medio', 2, 16.00),
  ('grande', 'Grande', 3, 22.00),
  ('240ml', '240 Ml', 2, 14.00),
  ('500ml', '500 Ml', 3, 22.00),
  ('600g', '600 Gramas', 4, 28.00),
  ('1kg', '1 Kg', 6, 45.00);

-- ========== CAIXAS DE CHOCOLATE ==========
INSERT INTO chocolate_boxes (id, name, units, price) VALUES
  ('box6', 'Caixa Pequena', 6, 48.00),
  ('box12', 'Caixa Media', 12, 89.00),
  ('box24', 'Caixa Grande', 24, 165.00);

-- ========== COBERTURAS ==========
INSERT INTO toppings (id, name, price) VALUES
  ('t1', 'Calda de Chocolate', 3.00),
  ('t2', 'Calda de Caramelo', 3.00),
  ('t3', 'Frutas Frescas', 4.00),
  ('t4', 'Granola', 3.00),
  ('t5', 'Chantilly', 2.50),
  ('t6', 'Castanhas Trituradas', 4.00);
