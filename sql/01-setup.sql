-- ============================================
-- GANTE — Criacao das Tabelas no Supabase
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New query)
--
-- Este script cria todas as tabelas necessarias
-- para o funcionamento da loja.
-- ============================================

-- ========== TABELA: categories ==========
-- Armazena categorias de gelato e chocolate
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gelato', 'chocolate')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== TABELA: products ==========
-- Armazena todos os produtos (gelatos, chocolates, diversos)
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT NULL,
  type TEXT NOT NULL CHECK (type IN ('gelato', 'chocolate', 'diversos')),
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== TABELA: gelato_sizes ==========
-- Tamanhos disponiveis para gelato
CREATE TABLE IF NOT EXISTS gelato_sizes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balls INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- ========== TABELA: chocolate_boxes ==========
-- Opcoes de caixas de chocolate
CREATE TABLE IF NOT EXISTS chocolate_boxes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- ========== TABELA: toppings ==========
-- Coberturas opcionais para gelato
CREATE TABLE IF NOT EXISTS toppings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- ========== INDICES ==========
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- ========== RLS (Row Level Security) ==========
-- Habilitar RLS nas tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gelato_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chocolate_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;

-- Politica de leitura publica (qualquer pessoa pode ver os produtos)
CREATE POLICY "Leitura publica de produtos" ON products
  FOR SELECT USING (true);

CREATE POLICY "Leitura publica de categorias" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Leitura publica de tamanhos" ON gelato_sizes
  FOR SELECT USING (true);

CREATE POLICY "Leitura publica de caixas" ON chocolate_boxes
  FOR SELECT USING (true);

CREATE POLICY "Leitura publica de coberturas" ON toppings
  FOR SELECT USING (true);

-- Politica de escrita com a chave anon (para o admin)
-- IMPORTANTE: Em producao, substitua por autenticacao real!
-- Por enquanto, permitimos INSERT/UPDATE/DELETE com a chave anon.
CREATE POLICY "Escrita com anon key - products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Escrita com anon key - categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);
