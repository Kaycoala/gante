// ============================================
// GANTE — CRUD Helpers (PHP/MySQL API)
// ============================================
//
// Este arquivo conecta ao backend PHP para ler e gravar
// produtos e categorias no MySQL. Todas as funcoes sao async.
//
// ENDPOINTS:
//   - /api/products.php    (GET, POST, PUT, DELETE)
//   - /api/categories.php  (GET, POST, PUT, DELETE)
//   - /api/extras.php      (GET - gelato_sizes, chocolate_boxes, toppings)

const API_BASE = '/api';

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

// ---- Helper para fetch ----
async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisicao');
  }
  return data;
}

// ---- Initialization ----
async function initData() {
  try {
    const [gelatos, chocolates, diversos, gelatoCats, chocoCats] = await Promise.all([
      getProducts('gelato'),
      getProducts('chocolate'),
      getProducts('diversos'),
      getCategories('gelato'),
      getCategories('chocolate'),
    ]);
    console.log('Dados carregados do MySQL com sucesso!');
    console.log('Gelatos:', gelatos.length, '| Chocolates:', chocolates.length, '| Diversos:', diversos.length);
    console.log('Categorias gelato:', gelatoCats.length, '| Categorias chocolate:', chocoCats.length);
  } catch (err) {
    console.error('Erro ao carregar dados do MySQL:', err);
  }
}

// ============================================
// PRODUCTS
// ============================================

async function getProducts(type) {
  try {
    const data = await apiFetch(`${API_BASE}/products.php?type=${encodeURIComponent(type)}`);
    return (data || []).map(mapProductFromDB);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    return [];
  }
}

async function getProductsByCategory(type, categoryId) {
  try {
    let url = `${API_BASE}/products.php?type=${encodeURIComponent(type)}`;
    if (categoryId && categoryId !== 'todos') {
      url += `&category=${encodeURIComponent(categoryId)}`;
    }
    const data = await apiFetch(url);
    return (data || []).map(mapProductFromDB);
  } catch (err) {
    console.error('Erro ao buscar produtos por categoria:', err);
    return [];
  }
}

async function getProductById(type, id) {
  try {
    const data = await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`);
    return data ? mapProductFromDB(data) : null;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    return null;
  }
}

async function addProduct(type, product) {
  try {
    const body = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || null,
      type: type,
      image_url: product.imageUrl || '',
    };

    const data = await apiFetch(`${API_BASE}/products.php`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    invalidateCache('products');
    return mapProductFromDB(data);
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    return null;
  }
}

async function updateProduct(type, id, updates) {
  try {
    const body = { id: id };
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.price !== undefined) body.price = updates.price;
    if (updates.category !== undefined) body.category = updates.category;
    if (updates.type !== undefined) body.type = updates.type;
    if (updates.imageUrl !== undefined) body.image_url = updates.imageUrl;

    const data = await apiFetch(`${API_BASE}/products.php`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    invalidateCache('products');
    return mapProductFromDB(data);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    return null;
  }
}

async function deleteProduct(type, id) {
  try {
    await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
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
    const data = await apiFetch(`${API_BASE}/categories.php?type=${encodeURIComponent(type)}`);
    return (data || []).map(mapCategoryFromDB);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    return [];
  }
}

async function addCategory(type, category) {
  try {
    const body = {
      name: category.name,
      type: type,
    };

    const data = await apiFetch(`${API_BASE}/categories.php`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    invalidateCache('categories');
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('Erro ao adicionar categoria:', err);
    return null;
  }
}

async function updateCategory(type, id, updates) {
  try {
    const body = {
      id: id,
      name: updates.name,
    };

    const data = await apiFetch(`${API_BASE}/categories.php`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    invalidateCache('categories');
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    return null;
  }
}

async function deleteCategory(type, id) {
  try {
    await apiFetch(`${API_BASE}/categories.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    invalidateCache('categories');
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
  }
}

// ============================================
// GELATO SIZES (somente leitura)
// ============================================

async function getGelatoSizes() {
  try {
    if (_cache.gelatoSizes) return _cache.gelatoSizes;
    const data = await apiFetch(`${API_BASE}/extras.php?table=gelato_sizes`);
    _cache.gelatoSizes = data || [];
    return _cache.gelatoSizes;
  } catch (err) {
    console.error('Erro ao buscar tamanhos de gelato:', err);
    return [];
  }
}

// ============================================
// TOPPINGS (somente leitura)
// ============================================

async function getToppings() {
  try {
    if (_cache.toppings) return _cache.toppings;
    const data = await apiFetch(`${API_BASE}/extras.php?table=toppings`);
    _cache.toppings = data || [];
    return _cache.toppings;
  } catch (err) {
    console.error('Erro ao buscar coberturas:', err);
    return [];
  }
}

// ============================================
// CHOCOLATE BOXES (somente leitura)
// ============================================

async function getChocolateBoxes() {
  try {
    if (_cache.chocolateBoxes) return _cache.chocolateBoxes;
    const data = await apiFetch(`${API_BASE}/extras.php?table=chocolate_boxes`);
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
