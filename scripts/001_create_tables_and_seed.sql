-- ============================================
-- GANTE — Script de Criacao das Tabelas no Supabase
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
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gelato_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chocolate_boxes ENABLE ROW LEVEL SECURITY;

-- Politicas de SELECT (leitura publica)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura publica' AND tablename = 'categories') THEN
    CREATE POLICY "Permitir leitura publica" ON categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura publica' AND tablename = 'products') THEN
    CREATE POLICY "Permitir leitura publica" ON products FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura publica' AND tablename = 'gelato_sizes') THEN
    CREATE POLICY "Permitir leitura publica" ON gelato_sizes FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura publica' AND tablename = 'toppings') THEN
    CREATE POLICY "Permitir leitura publica" ON toppings FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura publica' AND tablename = 'chocolate_boxes') THEN
    CREATE POLICY "Permitir leitura publica" ON chocolate_boxes FOR SELECT USING (true);
  END IF;
END $$;

-- Politicas de INSERT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insert publico' AND tablename = 'categories') THEN
    CREATE POLICY "Permitir insert publico" ON categories FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insert publico' AND tablename = 'products') THEN
    CREATE POLICY "Permitir insert publico" ON products FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insert publico' AND tablename = 'gelato_sizes') THEN
    CREATE POLICY "Permitir insert publico" ON gelato_sizes FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insert publico' AND tablename = 'toppings') THEN
    CREATE POLICY "Permitir insert publico" ON toppings FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insert publico' AND tablename = 'chocolate_boxes') THEN
    CREATE POLICY "Permitir insert publico" ON chocolate_boxes FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Politicas de UPDATE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update publico' AND tablename = 'categories') THEN
    CREATE POLICY "Permitir update publico" ON categories FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update publico' AND tablename = 'products') THEN
    CREATE POLICY "Permitir update publico" ON products FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update publico' AND tablename = 'gelato_sizes') THEN
    CREATE POLICY "Permitir update publico" ON gelato_sizes FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update publico' AND tablename = 'toppings') THEN
    CREATE POLICY "Permitir update publico" ON toppings FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update publico' AND tablename = 'chocolate_boxes') THEN
    CREATE POLICY "Permitir update publico" ON chocolate_boxes FOR UPDATE USING (true);
  END IF;
END $$;

-- Politicas de DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir delete publico' AND tablename = 'categories') THEN
    CREATE POLICY "Permitir delete publico" ON categories FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir delete publico' AND tablename = 'products') THEN
    CREATE POLICY "Permitir delete publico" ON products FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir delete publico' AND tablename = 'gelato_sizes') THEN
    CREATE POLICY "Permitir delete publico" ON gelato_sizes FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir delete publico' AND tablename = 'toppings') THEN
    CREATE POLICY "Permitir delete publico" ON toppings FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir delete publico' AND tablename = 'chocolate_boxes') THEN
    CREATE POLICY "Permitir delete publico" ON chocolate_boxes FOR DELETE USING (true);
  END IF;
END $$;
