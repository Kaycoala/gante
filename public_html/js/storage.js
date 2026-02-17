// ============================================
// GANTE — CRUD Helpers (PHP/MySQL API + Fallback)
// ============================================
//
// Este arquivo conecta ao backend PHP/MySQL na Hostinger.
// Se a API nao estiver disponivel (ex: ambiente local sem PHP),
// faz fallback automatico para os dados estaticos do data.js.
//
// ENDPOINTS (quando PHP esta ativo):
//   - /api/products.php    (GET, POST, PUT, DELETE)
//   - /api/categories.php  (GET, POST, PUT, DELETE)
//   - /api/extras.php      (GET - gelato_sizes, chocolate_boxes, toppings)

const API_BASE = '/api';

// Flag: a API PHP esta disponivel?
let _apiAvailable = null; // null = nao testado, true/false

// ---- Testar se a API PHP esta online ----
async function checkApiAvailability() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const resp = await fetch(`${API_BASE}/extras.php?table=gelato_sizes`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    // Se retornar JSON valido, API esta online
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) {
        _apiAvailable = true;
        return true;
      }
    }
    _apiAvailable = false;
    return false;
  } catch (e) {
    _apiAvailable = false;
    return false;
  }
}

// ---- Helper para fetch com tratamento de erro ----
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
  const online = await checkApiAvailability();
  if (online) {
    console.log('API PHP/MySQL disponivel. Dados serao carregados do banco.');
  } else {
    console.log('API PHP nao disponivel. Usando dados estaticos do data.js como fallback.');
  }
}

// ============================================
// PRODUCTS
// ============================================

async function getProducts(type) {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/products.php?type=${encodeURIComponent(type)}`);
      return (data || []).map(mapProductFromDB);
    } catch (err) {
      console.error('Erro API getProducts, usando fallback:', err);
    }
  }
  // Fallback: dados estaticos do data.js
  return getFallbackProducts(type);
}

async function getProductsByCategory(type, categoryId) {
  if (await checkApiAvailability()) {
    try {
      let url = `${API_BASE}/products.php?type=${encodeURIComponent(type)}`;
      if (categoryId && categoryId !== 'todos') {
        url += `&category=${encodeURIComponent(categoryId)}`;
      }
      const data = await apiFetch(url);
      return (data || []).map(mapProductFromDB);
    } catch (err) {
      console.error('Erro API getProductsByCategory, usando fallback:', err);
    }
  }
  // Fallback
  const products = getFallbackProducts(type);
  if (!categoryId || categoryId === 'todos') return products;
  return products.filter(p => p.category === categoryId);
}

async function getProductById(type, id) {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`);
      return data ? mapProductFromDB(data) : null;
    } catch (err) {
      console.error('Erro API getProductById, usando fallback:', err);
    }
  }
  // Fallback
  const products = getFallbackProducts(type);
  return products.find(p => String(p.id) === String(id)) || null;
}

async function addProduct(type, product) {
  if (await checkApiAvailability()) {
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
      return mapProductFromDB(data);
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      return null;
    }
  }
  console.warn('API indisponivel. Nao e possivel adicionar produtos sem o backend PHP.');
  return null;
}

async function updateProduct(type, id, updates) {
  if (await checkApiAvailability()) {
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
      return mapProductFromDB(data);
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      return null;
    }
  }
  console.warn('API indisponivel. Nao e possivel atualizar produtos sem o backend PHP.');
  return null;
}

async function deleteProduct(type, id) {
  if (await checkApiAvailability()) {
    try {
      await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return;
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  }
  console.warn('API indisponivel. Nao e possivel deletar produtos sem o backend PHP.');
}

// ============================================
// CATEGORIES
// ============================================

async function getCategories(type) {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/categories.php?type=${encodeURIComponent(type)}`);
      return (data || []).map(mapCategoryFromDB);
    } catch (err) {
      console.error('Erro API getCategories, usando fallback:', err);
    }
  }
  // Fallback
  return getFallbackCategories(type);
}

async function addCategory(type, category) {
  if (await checkApiAvailability()) {
    try {
      const body = { name: category.name, type: type };
      const data = await apiFetch(`${API_BASE}/categories.php`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return mapCategoryFromDB(data);
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      return null;
    }
  }
  console.warn('API indisponivel.');
  return null;
}

async function updateCategory(type, id, updates) {
  if (await checkApiAvailability()) {
    try {
      const body = { id: id, name: updates.name };
      const data = await apiFetch(`${API_BASE}/categories.php`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return mapCategoryFromDB(data);
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      return null;
    }
  }
  console.warn('API indisponivel.');
  return null;
}

async function deleteCategory(type, id) {
  if (await checkApiAvailability()) {
    try {
      await apiFetch(`${API_BASE}/categories.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return;
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
    }
  }
  console.warn('API indisponivel.');
}

// ============================================
// GELATO SIZES (somente leitura)
// ============================================

async function getGelatoSizes() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=gelato_sizes`);
      return data || [];
    } catch (err) {
      console.error('Erro API getGelatoSizes, usando fallback:', err);
    }
  }
  // Fallback
  return typeof GELATO_SIZES !== 'undefined' ? GELATO_SIZES : [];
}

// ============================================
// TOPPINGS (somente leitura)
// ============================================

async function getToppings() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=toppings`);
      return data || [];
    } catch (err) {
      console.error('Erro API getToppings, usando fallback:', err);
    }
  }
  return typeof TOPPINGS !== 'undefined' ? TOPPINGS : [];
}

// ============================================
// CHOCOLATE BOXES (somente leitura)
// ============================================

async function getChocolateBoxes() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=chocolate_boxes`);
      return data || [];
    } catch (err) {
      console.error('Erro API getChocolateBoxes, usando fallback:', err);
    }
  }
  return typeof CHOCOLATE_BOXES !== 'undefined' ? CHOCOLATE_BOXES : [];
}

// ============================================
// FALLBACK: Dados estaticos do data.js
// ============================================

function getFallbackProducts(type) {
  switch (type) {
    case 'gelato':
      return typeof SEED_GELATOS !== 'undefined' ? SEED_GELATOS : [];
    case 'chocolate':
      return typeof SEED_CHOCOLATES !== 'undefined' ? SEED_CHOCOLATES : [];
    case 'diversos':
      return typeof SEED_DIVERSOS !== 'undefined' ? SEED_DIVERSOS : [];
    default:
      return [];
  }
}

function getFallbackCategories(type) {
  switch (type) {
    case 'gelato':
      return typeof GELATO_CATEGORIES !== 'undefined' ? GELATO_CATEGORIES : [];
    case 'chocolate':
      return typeof CHOCOLATE_CATEGORIES !== 'undefined' ? CHOCOLATE_CATEGORIES : [];
    default:
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
