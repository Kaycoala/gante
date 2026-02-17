// ============================================
// GANTE — CRUD Helpers (PHP/MySQL API)
// ============================================
//
// Este arquivo conecta ao backend PHP/MySQL na Hostinger.
// Se a API nao estiver disponivel, usa dados estaticos do data.js.
//
// ENDPOINTS:
//   - /api/products.php    (GET, POST, PUT, DELETE)
//   - /api/categories.php  (GET, POST, PUT, DELETE)
//   - /api/extras.php      (GET - gelato_sizes, chocolate_boxes, toppings)

const API_BASE = '/api';

// Flag: a API PHP esta disponivel?
let _apiAvailable = null; // null = nao testado, true/false

// ---- Testar se a API PHP esta online ----
async function checkApiAvailability() {
  // Ja testou e esta online? Nao re-testar
  if (_apiAvailable === true) return true;

  try {
    console.log('[v0] Testando disponibilidade da API PHP...');
    const resp = await fetch(`${API_BASE}/extras.php?table=gelato_sizes`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    console.log('[v0] API respondeu com status:', resp.status);

    if (resp.ok) {
      const text = await resp.text();
      console.log('[v0] Resposta da API (primeiros 300 chars):', text.substring(0, 300));
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          _apiAvailable = true;
          console.log('[v0] API PHP disponivel! Dados virao do MySQL.');
          return true;
        }
      } catch (parseErr) {
        console.warn('[v0] API retornou resposta nao-JSON:', text.substring(0, 500));
      }
    }

    _apiAvailable = false;
    console.warn('[v0] API PHP nao disponivel. Usando fallback data.js.');
    return false;
  } catch (e) {
    _apiAvailable = false;
    console.warn('[v0] Erro ao testar API:', e.message);
    return false;
  }
}

// ---- Helper para fetch com tratamento de erro ----
async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('[v0] apiFetch: resposta nao-JSON de', url, ':', text.substring(0, 500));
    throw new Error('Resposta invalida do servidor');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisicao');
  }
  return data;
}

// ---- Initialization ----
async function initData() {
  const online = await checkApiAvailability();
  if (online) {
    console.log('[v0] initData: API PHP/MySQL ativa.');
  } else {
    console.log('[v0] initData: Usando fallback data.js.');
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
      console.error('[v0] Erro API getProducts:', err);
    }
  }
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
      console.error('[v0] Erro API getProductsByCategory:', err);
    }
  }
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
      console.error('[v0] Erro API getProductById:', err);
    }
  }
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
      console.log('[v0] addProduct enviando:', JSON.stringify(body));
      const data = await apiFetch(`${API_BASE}/products.php`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('[v0] addProduct resposta:', data);
      return mapProductFromDB(data);
    } catch (err) {
      console.error('[v0] Erro ao adicionar produto:', err);
      return null;
    }
  }
  console.warn('[v0] API indisponivel. Nao e possivel adicionar produtos.');
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

      console.log('[v0] updateProduct enviando:', JSON.stringify(body));
      const data = await apiFetch(`${API_BASE}/products.php`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      console.log('[v0] updateProduct resposta:', data);
      return mapProductFromDB(data);
    } catch (err) {
      console.error('[v0] Erro ao atualizar produto:', err);
      return null;
    }
  }
  console.warn('[v0] API indisponivel. Nao e possivel atualizar produtos.');
  return null;
}

async function deleteProduct(type, id) {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      console.log('[v0] deleteProduct resposta:', data);
      return;
    } catch (err) {
      console.error('[v0] Erro ao deletar produto:', err);
    }
  }
  console.warn('[v0] API indisponivel. Nao e possivel deletar produtos.');
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
      console.error('[v0] Erro API getCategories:', err);
    }
  }
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
      console.error('[v0] Erro ao adicionar categoria:', err);
      return null;
    }
  }
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
      console.error('[v0] Erro ao atualizar categoria:', err);
      return null;
    }
  }
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
      console.error('[v0] Erro ao deletar categoria:', err);
    }
  }
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
      console.error('[v0] Erro API getGelatoSizes:', err);
    }
  }
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
      console.error('[v0] Erro API getToppings:', err);
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
      console.error('[v0] Erro API getChocolateBoxes:', err);
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
    description: row.description || '',
    price: Number(row.price),
    category: row.category !== null && row.category !== undefined ? String(row.category) : null,
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

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
