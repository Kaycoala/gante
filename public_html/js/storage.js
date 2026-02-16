// ============================================
// GANTE — CRUD Helpers (Supabase)
// ============================================
//
// Este arquivo conecta ao Supabase para ler e gravar
// produtos e categorias. Todas as funcoes sao async.
//
// TABELAS NO SUPABASE:
//   - products        (id, name, description, price, category, type, image_url, created_at)
//   - categories      (id, name, type, created_at)
//   - gelato_sizes    (id, name, balls, price)
//   - chocolate_boxes (id, name, units, price)
//   - toppings        (id, name, price)
//
// O campo "type" em products pode ser: 'gelato', 'chocolate', 'diversos'
// O campo "type" em categories pode ser: 'gelato', 'chocolate'

// ---- Cache local para evitar chamadas repetidas ----
let _cache = {
  products: null,
  categories: null,
  gelatoSizes: null,
  chocolateBoxes: null,
  toppings: null,
};

function invalidateCache(key) {
  if (key) {
    _cache[key] = null;
  } else {
    _cache = { products: null, categories: null, gelatoSizes: null, chocolateBoxes: null, toppings: null };
  }
}

// ---- Initialization ----
// Nao precisa mais de initData() para seed local.
// Os dados iniciais sao inseridos via SQL (seed.sql).
// Mantemos a funcao para compatibilidade, mas ela apenas
// carrega os dados do Supabase em cache.
async function initData() {
  try {
    // Pre-carregar dados em cache para evitar delay na UI
    const [gelatos, chocolates, diversos, gelatoCats, chocoCats] = await Promise.all([
      getProducts('gelato'),
      getProducts('chocolate'),
      getProducts('diversos'),
      getCategories('gelato'),
      getCategories('chocolate'),
    ]);
    console.log('[v0] Gelatos carregados:', gelatos.length, gelatos);
    console.log('[v0] Chocolates carregados:', chocolates.length, chocolates);
    console.log('[v0] Diversos carregados:', diversos.length, diversos);
    console.log('[v0] Categorias gelato:', gelatoCats.length, gelatoCats);
    console.log('[v0] Categorias chocolate:', chocoCats.length, chocoCats);
    console.log('Dados carregados do Supabase com sucesso!');
  } catch (err) {
    console.error('Erro ao carregar dados do Supabase:', err);
  }
}

// ============================================
// PRODUCTS
// ============================================

async function getProducts(type) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mapear snake_case para camelCase para compatibilidade com o frontend
    return (data || []).map(mapProductFromDB);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    return [];
  }
}

async function getProductsByCategory(type, categoryId) {
  try {
    let query = supabaseClient
      .from('products')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true });

    if (categoryId && categoryId !== 'todos') {
      query = query.eq('category', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapProductFromDB);
  } catch (err) {
    console.error('Erro ao buscar produtos por categoria:', err);
    return [];
  }
}

async function getProductById(type, id) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapProductFromDB(data) : null;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    return null;
  }
}

async function addProduct(type, product) {
  try {
    const dbProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || null,
      type: type,
      image_url: product.imageUrl || '',
    };

    const { data, error } = await supabaseClient
      .from('products')
      .insert(dbProduct)
      .select()
      .single();

    if (error) throw error;
    invalidateCache('products');
    return mapProductFromDB(data);
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    return null;
  }
}

async function updateProduct(type, id, updates) {
  try {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { data, error } = await supabaseClient
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    invalidateCache('products');
    return mapProductFromDB(data);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    return null;
  }
}

async function deleteProduct(type, id) {
  try {
    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    invalidateCache('products');
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
  }
}

// ============================================
// CATEGORIES
// ============================================

async function getCategories(type) {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCategoryFromDB);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    return [];
  }
}

async function addCategory(type, category) {
  try {
    const dbCategory = {
      name: category.name,
      type: type,
    };

    const { data, error } = await supabaseClient
      .from('categories')
      .insert(dbCategory)
      .select()
      .single();

    if (error) throw error;
    invalidateCache('categories');
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('Erro ao adicionar categoria:', err);
    return null;
  }
}

async function updateCategory(type, id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .update({ name: updates.name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    invalidateCache('categories');
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    return null;
  }
}

async function deleteCategory(type, id) {
  try {
    const { error } = await supabaseClient
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    invalidateCache('categories');
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
  }
}

// ============================================
// GELATO SIZES (somente leitura, dados vem do seed)
// ============================================

async function getGelatoSizes() {
  try {
    if (_cache.gelatoSizes) return _cache.gelatoSizes;

    const { data, error } = await supabaseClient
      .from('gelato_sizes')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    _cache.gelatoSizes = data || [];
    return _cache.gelatoSizes;
  } catch (err) {
    console.error('Erro ao buscar tamanhos de gelato:', err);
    return [];
  }
}

// ============================================
// TOPPINGS (somente leitura, dados vem do seed)
// ============================================

async function getToppings() {
  try {
    if (_cache.toppings) return _cache.toppings;

    const { data, error } = await supabaseClient
      .from('toppings')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    _cache.toppings = data || [];
    return _cache.toppings;
  } catch (err) {
    console.error('Erro ao buscar coberturas:', err);
    return [];
  }
}

// ============================================
// CHOCOLATE BOXES (somente leitura, dados vem do seed)
// ============================================

async function getChocolateBoxes() {
  try {
    if (_cache.chocolateBoxes) return _cache.chocolateBoxes;

    const { data, error } = await supabaseClient
      .from('chocolate_boxes')
      .select('*')
      .order('units', { ascending: true });

    if (error) throw error;
    _cache.chocolateBoxes = data || [];
    return _cache.chocolateBoxes;
  } catch (err) {
    console.error('Erro ao buscar caixas de chocolate:', err);
    return [];
  }
}

// ============================================
// MAPPERS (snake_case DB -> camelCase Frontend)
// ============================================

function mapProductFromDB(row) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category ? String(row.category) : null,
    type: row.type,
    imageUrl: row.image_url || '',
  };
}

function mapCategoryFromDB(row) {
  return {
    id: String(row.id),
    name: row.name,
    type: row.type,
  };
}

// ============================================
// UPLOAD DE IMAGEM PARA SUPABASE STORAGE
// ============================================
// Para usar uploads de imagem no Supabase Storage,
// crie um bucket chamado "product-images" no painel.
// Descomente e use as funcoes abaixo:
//
// async function uploadProductImage(file, type, productId) {
//   const ext = file.name.split('.').pop();
//   const path = `${type}/${productId}_${Date.now()}.${ext}`;
//
//   const { data, error } = await supabaseClient.storage
//     .from('product-images')
//     .upload(path, file, { cacheControl: '3600', upsert: false });
//
//   if (error) throw error;
//
//   const { data: urlData } = supabase.storage
//     .from('product-images')
//     .getPublicUrl(path);
//
//   return urlData.publicUrl;
// }
//
// async function deleteProductImage(imageUrl) {
//   if (!imageUrl) return;
//   try {
//     // Extrair o path do URL publico
//     const url = new URL(imageUrl);
//     const pathParts = url.pathname.split('/storage/v1/object/public/product-images/');
//     if (pathParts.length < 2) return;
//     const filePath = pathParts[1];
//
//     await supabaseClient.storage
//       .from('product-images')
//       .remove([filePath]);
//   } catch (e) {
//     console.warn('Erro ao deletar imagem:', e);
//   }
// }

// ---- Utilities ----
function formatPrice(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ---- Upload de imagem local (converte para base64 - fallback) ----
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
