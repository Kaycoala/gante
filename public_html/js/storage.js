// ============================================
// GANTE — CRUD Layer (Supabase + Fallback Local)
// ============================================
// Se o Supabase estiver configurado, usa o banco de dados.
// Caso contrario, usa os dados locais do data.js com localStorage.

// ---- Local data store (fallback) ----
// Inicializa com dados do data.js e persiste mudancas no localStorage
const LOCAL_STORE_KEY = 'gante_local_store_v2';

function getLocalStore() {
  const saved = localStorage.getItem(LOCAL_STORE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* ignore */ }
  }
  // Inicializa a partir do data.js
  const store = {
    products: [
      ...SEED_GELATOS.map(p => ({ ...p })),
      ...SEED_CHOCOLATES.map(p => ({ ...p })),
      ...SEED_DIVERSOS.map(p => ({ ...p })),
    ],
    categories: [
      ...GELATO_CATEGORIES.map(c => ({ ...c, type: 'gelato' })),
      ...CHOCOLATE_CATEGORIES.map(c => ({ ...c, type: 'chocolate' })),
    ],
    gelato_sizes: GELATO_SIZES.map((s, i) => ({ ...s, sort_order: i })),
    toppings: TOPPINGS.map(t => ({ ...t })),
    chocolate_boxes: CHOCOLATE_BOXES.map(b => ({ ...b })),
  };
  localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
  return store;
}

function saveLocalStore(store) {
  localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
}

// ---- Helper: check if using Supabase ----
function useSupabase() {
  return typeof SUPABASE_CONFIGURED !== 'undefined' && SUPABASE_CONFIGURED && supabase !== null;
}

// ============================================
// PRODUCTS
// ============================================

async function getProducts(type) {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true });
    if (error) { console.error('getProducts error:', error); return []; }
    return (data || []).map(mapProductFromDb);
  }
  // Fallback local
  const store = getLocalStore();
  return store.products.filter(p => p.type === type);
}

async function getProductsByCategory(type, categoryId) {
  if (!categoryId || categoryId === 'todos') return getProducts(type);
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', type)
      .eq('category', categoryId)
      .order('created_at', { ascending: true });
    if (error) { console.error('getProductsByCategory error:', error); return []; }
    return (data || []).map(mapProductFromDb);
  }
  const store = getLocalStore();
  return store.products.filter(p => p.type === type && p.category === categoryId);
}

async function getProductById(type, id) {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('getProductById error:', error); return null; }
    return data ? mapProductFromDb(data) : null;
  }
  const store = getLocalStore();
  return store.products.find(p => p.id === id) || null;
}

async function addProduct(type, product) {
  const id = type.charAt(0) + Date.now();
  if (useSupabase()) {
    const row = {
      id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || null,
      type: type,
      image_url: product.imageUrl || '',
    };
    const { data, error } = await supabase
      .from('products')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('addProduct error:', error); return null; }
    return mapProductFromDb(data);
  }
  // Fallback local
  const store = getLocalStore();
  const newProduct = {
    id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    category: product.category || null,
    type: type,
    imageUrl: product.imageUrl || '',
  };
  store.products.push(newProduct);
  saveLocalStore(store);
  return newProduct;
}

async function updateProduct(type, id, updates) {
  if (useSupabase()) {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.price !== undefined) row.price = updates.price;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.type !== undefined) row.type = updates.type;
    if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('updateProduct error:', error); return null; }
    return mapProductFromDb(data);
  }
  const store = getLocalStore();
  const idx = store.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  Object.assign(store.products[idx], updates);
  saveLocalStore(store);
  return store.products[idx];
}

async function deleteProduct(type, id) {
  if (useSupabase()) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) console.error('deleteProduct error:', error);
    return;
  }
  const store = getLocalStore();
  store.products = store.products.filter(p => p.id !== id);
  saveLocalStore(store);
}

function mapProductFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    type: row.type,
    imageUrl: row.image_url || '',
  };
}

// ============================================
// CATEGORIES
// ============================================

async function getCategories(type) {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true });
    if (error) { console.error('getCategories error:', error); return []; }
    return data || [];
  }
  const store = getLocalStore();
  return store.categories.filter(c => c.type === type);
}

async function addCategory(type, category) {
  const id = category.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + Date.now();
  if (useSupabase()) {
    const row = { id, name: category.name, type };
    const { data, error } = await supabase
      .from('categories')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('addCategory error:', error); return null; }
    return data;
  }
  const store = getLocalStore();
  const newCat = { id, name: category.name, type };
  store.categories.push(newCat);
  saveLocalStore(store);
  return newCat;
}

async function updateCategory(type, id, updates) {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: updates.name })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('updateCategory error:', error); return null; }
    return data;
  }
  const store = getLocalStore();
  const cat = store.categories.find(c => c.id === id);
  if (!cat) return null;
  cat.name = updates.name;
  saveLocalStore(store);
  return cat;
}

async function deleteCategory(type, id) {
  if (useSupabase()) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) console.error('deleteCategory error:', error);
    return;
  }
  const store = getLocalStore();
  store.categories = store.categories.filter(c => c.id !== id);
  saveLocalStore(store);
}

// ============================================
// GELATO SIZES
// ============================================

async function getGelatoSizes() {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('gelato_sizes')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) { console.error('getGelatoSizes error:', error); return []; }
    return (data || []).map(mapGelatoSizeFromDb);
  }
  const store = getLocalStore();
  return store.gelato_sizes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

async function addGelatoSize(size) {
  const id = 'sz' + Date.now();
  if (useSupabase()) {
    const row = { id, name: size.name, balls: size.balls, price: size.price, sort_order: size.sort_order || 0 };
    const { data, error } = await supabase
      .from('gelato_sizes')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('addGelatoSize error:', error); return null; }
    return mapGelatoSizeFromDb(data);
  }
  const store = getLocalStore();
  const newSize = { id, name: size.name, balls: size.balls, price: size.price, sort_order: size.sort_order || 0 };
  store.gelato_sizes.push(newSize);
  saveLocalStore(store);
  return newSize;
}

async function updateGelatoSize(id, updates) {
  if (useSupabase()) {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.balls !== undefined) row.balls = updates.balls;
    if (updates.price !== undefined) row.price = updates.price;
    if (updates.sort_order !== undefined) row.sort_order = updates.sort_order;
    const { data, error } = await supabase
      .from('gelato_sizes')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('updateGelatoSize error:', error); return null; }
    return mapGelatoSizeFromDb(data);
  }
  const store = getLocalStore();
  const size = store.gelato_sizes.find(s => s.id === id);
  if (!size) return null;
  Object.assign(size, updates);
  saveLocalStore(store);
  return size;
}

async function deleteGelatoSize(id) {
  if (useSupabase()) {
    const { error } = await supabase.from('gelato_sizes').delete().eq('id', id);
    if (error) console.error('deleteGelatoSize error:', error);
    return;
  }
  const store = getLocalStore();
  store.gelato_sizes = store.gelato_sizes.filter(s => s.id !== id);
  saveLocalStore(store);
}

function mapGelatoSizeFromDb(row) {
  return { id: row.id, name: row.name, balls: Number(row.balls), price: Number(row.price), sort_order: Number(row.sort_order || 0) };
}

// ============================================
// TOPPINGS
// ============================================

async function getToppings() {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { console.error('getToppings error:', error); return []; }
    return (data || []).map(mapToppingFromDb);
  }
  const store = getLocalStore();
  return store.toppings;
}

async function addTopping(topping) {
  const id = 't' + Date.now();
  if (useSupabase()) {
    const row = { id, name: topping.name, price: topping.price };
    const { data, error } = await supabase.from('toppings').insert(row).select().single();
    if (error) { console.error('addTopping error:', error); return null; }
    return mapToppingFromDb(data);
  }
  const store = getLocalStore();
  const newT = { id, name: topping.name, price: topping.price };
  store.toppings.push(newT);
  saveLocalStore(store);
  return newT;
}

async function updateTopping(id, updates) {
  if (useSupabase()) {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.price !== undefined) row.price = updates.price;
    const { data, error } = await supabase.from('toppings').update(row).eq('id', id).select().single();
    if (error) { console.error('updateTopping error:', error); return null; }
    return mapToppingFromDb(data);
  }
  const store = getLocalStore();
  const t = store.toppings.find(t => t.id === id);
  if (!t) return null;
  Object.assign(t, updates);
  saveLocalStore(store);
  return t;
}

async function deleteTopping(id) {
  if (useSupabase()) {
    const { error } = await supabase.from('toppings').delete().eq('id', id);
    if (error) console.error('deleteTopping error:', error);
    return;
  }
  const store = getLocalStore();
  store.toppings = store.toppings.filter(t => t.id !== id);
  saveLocalStore(store);
}

function mapToppingFromDb(row) {
  return { id: row.id, name: row.name, price: Number(row.price) };
}

// ============================================
// CHOCOLATE BOXES
// ============================================

async function getChocolateBoxes() {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from('chocolate_boxes')
      .select('*')
      .order('units', { ascending: true });
    if (error) { console.error('getChocolateBoxes error:', error); return []; }
    return (data || []).map(mapChocolateBoxFromDb);
  }
  const store = getLocalStore();
  return store.chocolate_boxes.sort((a, b) => a.units - b.units);
}

async function addChocolateBox(box) {
  const id = 'box' + Date.now();
  if (useSupabase()) {
    const row = { id, name: box.name, units: box.units, price: box.price };
    const { data, error } = await supabase.from('chocolate_boxes').insert(row).select().single();
    if (error) { console.error('addChocolateBox error:', error); return null; }
    return mapChocolateBoxFromDb(data);
  }
  const store = getLocalStore();
  const newBox = { id, name: box.name, units: box.units, price: box.price };
  store.chocolate_boxes.push(newBox);
  saveLocalStore(store);
  return newBox;
}

async function updateChocolateBox(id, updates) {
  if (useSupabase()) {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.units !== undefined) row.units = updates.units;
    if (updates.price !== undefined) row.price = updates.price;
    const { data, error } = await supabase.from('chocolate_boxes').update(row).eq('id', id).select().single();
    if (error) { console.error('updateChocolateBox error:', error); return null; }
    return mapChocolateBoxFromDb(data);
  }
  const store = getLocalStore();
  const b = store.chocolate_boxes.find(b => b.id === id);
  if (!b) return null;
  Object.assign(b, updates);
  saveLocalStore(store);
  return b;
}

async function deleteChocolateBox(id) {
  if (useSupabase()) {
    const { error } = await supabase.from('chocolate_boxes').delete().eq('id', id);
    if (error) console.error('deleteChocolateBox error:', error);
    return;
  }
  const store = getLocalStore();
  store.chocolate_boxes = store.chocolate_boxes.filter(b => b.id !== id);
  saveLocalStore(store);
}

function mapChocolateBoxFromDb(row) {
  return { id: row.id, name: row.name, units: Number(row.units), price: Number(row.price) };
}

// ============================================
// UTILITIES
// ============================================

function formatPrice(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// initData - no-op, dados vem do data.js ou Supabase
async function initData() {
  if (useSupabase()) {
    console.log('Usando dados do Supabase.');
  } else {
    console.log('Usando dados locais do data.js com localStorage.');
  }
  return;
}
