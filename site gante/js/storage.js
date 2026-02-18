// ============================================
// GANTE — CRUD Helpers (PHP/MySQL API)
// ============================================
//
// Este arquivo conecta ao backend PHP/MySQL na Hostinger.
// Se a API nao estiver disponivel, retorna arrays vazios.
// Nenhum dado hardcoded e exibido — somente dados do banco.
//
// ENDPOINTS:
//   - /api/products.php    (GET, POST, PUT, DELETE)
//   - /api/categories.php  (GET, POST, PUT, DELETE)
//   - /api/extras.php      (GET - gelato_sizes, chocolate_boxes, toppings)

// Base URL do site (para imagens absolutas)
const SITE_BASE_URL = 'https://ganteartesanal.com.br';

const API_BASE = '/api';

// ---- Testar se a API PHP esta online ----
// SEMPRE forca uma verificacao nova a cada chamada (sem cache)
async function checkApiAvailability() {
  try {
    const resp = await fetch(`${API_BASE}/extras.php?table=gelato_sizes`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (resp.ok) {
      const text = await resp.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          return true;
        }
      } catch (parseErr) {
        // resposta nao-JSON
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// ---- Helper para fetch com tratamento de erro ----
async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('[Gante] apiFetch ERRO: resposta nao-JSON de', url);
    console.error('[Gante] Status:', response.status, '| Resposta:', text.substring(0, 1000));
    throw new Error('Servidor retornou resposta invalida (status ' + response.status + '). Possivel erro PHP.');
  }

  if (!response.ok) {
    console.error('[Gante] apiFetch ERRO HTTP', response.status, ':', data.error || JSON.stringify(data));
    throw new Error(data.error || 'Erro HTTP ' + response.status);
  }
  return data;
}

// ---- Initialization ----
// Limpa qualquer cache/cookie/storage antigo e forca busca do banco
async function initData() {
  // Limpar localStorage e sessionStorage de dados antigos
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('gante_') || key.startsWith('data_') || key.startsWith('products_') || key.startsWith('categories_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Limpar cookies relacionados a dados
    document.cookie.split(';').forEach(c => {
      const name = c.trim().split('=')[0];
      if (name && (name.startsWith('gante_') || name.startsWith('data_') || name.startsWith('products_'))) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    });
  } catch (e) {
    // Ignorar erros de limpeza
  }

  await checkApiAvailability();
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
      console.error('[Gante] Erro API getProducts:', err);
    }
  }
  return [];
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
      console.error('[Gante] Erro API getProductsByCategory:', err);
    }
  }
  return [];
}

async function getProductById(type, id) {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`);
      return data ? mapProductFromDB(data) : null;
    } catch (err) {
      console.error('[Gante] Erro API getProductById:', err);
    }
  }
  return null;
}

async function addProduct(type, product) {
  // Operacoes de escrita tentam direto, sem depender do cache
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
    console.error('[Gante] Erro ao adicionar produto:', err);
    return null;
  }
}

async function updateProduct(type, id, updates) {
  // Operacoes de escrita tentam direto, sem depender do cache
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
    console.error('[Gante] Erro ao atualizar produto:', err);
    return null;
  }
}

async function deleteProduct(type, id) {
  try {
    await apiFetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('[Gante] Erro ao deletar produto:', err);
    throw err;
  }
}

// ============================================
// CATEGORIES
// ============================================

async function getCategories(type) {
  if (await checkApiAvailability()) {
    try {
      const url = `${API_BASE}/categories.php?type=${encodeURIComponent(type)}`;
      console.log('[Gante] getCategories buscando:', url);
      const data = await apiFetch(url);
      const result = (data || []).map(mapCategoryFromDB);
      console.log('[Gante] getCategories resultado para', type, ':', result.length, 'categorias');
      return result;
    } catch (err) {
      console.error('[Gante] Erro API getCategories para tipo "' + type + '":', err);
    }
  } else {
    console.warn('[Gante] API indisponivel para getCategories tipo:', type);
  }
  return [];
}

async function addCategory(type, category) {
  try {
    const body = { name: category.name, type: type };
    console.log('[Gante] addCategory enviando:', JSON.stringify(body));
    const data = await apiFetch(`${API_BASE}/categories.php`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    console.log('[Gante] addCategory resposta:', JSON.stringify(data));
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('[Gante] Erro ao adicionar categoria:', err);
    console.error('[Gante] Tipo:', type, '| Nome:', category.name);
    return null;
  }
}

async function updateCategory(type, id, updates) {
  try {
    const body = { id: id, name: updates.name };
    const data = await apiFetch(`${API_BASE}/categories.php`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return mapCategoryFromDB(data);
  } catch (err) {
    console.error('[Gante] Erro ao atualizar categoria:', err);
    return null;
  }
}

async function deleteCategory(type, id) {
  try {
    await apiFetch(`${API_BASE}/categories.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('[Gante] Erro ao deletar categoria:', err);
    throw err;
  }
}

// ============================================
// GELATO SIZES (somente leitura)
// ============================================

async function getGelatoSizes() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=gelato_sizes`);
      return (data || []).map(s => ({
        ...s,
        id: s.id !== undefined ? String(s.id) : s.id,
        price: Number(s.price) || 0,
        balls: Number(s.balls) || 1,
      }));
    } catch (err) {
      console.error('[Gante] Erro API getGelatoSizes:', err);
    }
  }
  return [];
}

// ============================================
// TOPPINGS (somente leitura)
// ============================================

async function getToppings() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=toppings`);
      return (data || []).map(t => ({
        ...t,
        id: t.id !== undefined ? String(t.id) : t.id,
        price: Number(t.price) || 0,
      }));
    } catch (err) {
      console.error('[Gante] Erro API getToppings:', err);
    }
  }
  return [];
}

// ============================================
// CHOCOLATE BOXES (somente leitura)
// ============================================

async function getChocolateBoxes() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=chocolate_boxes`);
      return (data || []).map(b => ({
        ...b,
        id: b.id !== undefined ? String(b.id) : b.id,
        price: Number(b.price) || 0,
        slots: Number(b.slots) || 0,
      }));
    } catch (err) {
      console.error('[Gante] Erro API getChocolateBoxes:', err);
    }
  }
  return [];
}

// ============================================
// SEM FALLBACK: Sem banco = sem dados exibidos
// ============================================

// ============================================
// FLAVORS OF THE DAY
// ============================================

async function getFlavorsOfTheDay() {
  if (await checkApiAvailability()) {
    try {
      const data = await apiFetch(`${API_BASE}/extras.php?table=flavors_of_the_day`);
      return (data || []).map(mapProductFromDB);
    } catch (err) {
      console.error('[Gante] Erro API getFlavorsOfTheDay:', err);
    }
  }
  return [];
}

async function setFlavorsOfTheDay(productIds) {
  try {
    const data = await apiFetch(`${API_BASE}/extras.php`, {
      method: 'POST',
      body: JSON.stringify({ table: 'flavors_of_the_day', product_ids: productIds }),
    });
    return data;
  } catch (err) {
    console.error('[Gante] Erro ao salvar sabores do dia:', err);
    return null;
  }
}

// ============================================
// MAPPERS (snake_case DB -> camelCase Frontend)
// ============================================

function mapProductFromDB(row) {
  let imageUrl = row.image_url || '';

  // Garantir que a URL da imagem seja absoluta para funcionar em qualquer dispositivo
  if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
    // Remove barra inicial se houver
    imageUrl = imageUrl.replace(/^\//, '');
    imageUrl = SITE_BASE_URL + '/' + imageUrl;
  }

  return {
    id: String(row.id),
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    category: row.category !== null && row.category !== undefined ? String(row.category) : null,
    type: row.type,
    imageUrl: imageUrl,
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
