// ============================================
// GANTE — CRUD via Supabase
// ============================================
// Todas as funcoes sao async e retornam Promises.
// O client `supabase` e inicializado no supabase-config.js.

// ---- Products ----
async function getProducts(type) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true });
  if (error) { console.error('getProducts error:', error); return []; }
  // Mapear image_url -> imageUrl para compatibilidade com o front
  return (data || []).map(mapProductFromDb);
}

async function getProductsByCategory(type, categoryId) {
  if (!categoryId || categoryId === 'todos') return getProducts(type);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', type)
    .eq('category', categoryId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getProductsByCategory error:', error); return []; }
  return (data || []).map(mapProductFromDb);
}

async function getProductById(type, id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getProductById error:', error); return null; }
  return data ? mapProductFromDb(data) : null;
}

async function addProduct(type, product) {
  const id = type.charAt(0) + Date.now();
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

async function updateProduct(type, id, updates) {
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

async function deleteProduct(type, id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteProduct error:', error);
}

// Mapear colunas do DB (snake_case) para o front (camelCase)
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

// ---- Categories ----
async function getCategories(type) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true });
  if (error) { console.error('getCategories error:', error); return []; }
  return data || [];
}

async function addCategory(type, category) {
  const id = category.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + Date.now();
  const row = { id, name: category.name, type };
  const { data, error } = await supabase
    .from('categories')
    .insert(row)
    .select()
    .single();
  if (error) { console.error('addCategory error:', error); return null; }
  return data;
}

async function updateCategory(type, id, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name: updates.name })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateCategory error:', error); return null; }
  return data;
}

async function deleteCategory(type, id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteCategory error:', error);
}

// ---- Gelato Sizes ----
async function getGelatoSizes() {
  const { data, error } = await supabase
    .from('gelato_sizes')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getGelatoSizes error:', error); return []; }
  return (data || []).map(mapGelatoSizeFromDb);
}

async function addGelatoSize(size) {
  const id = 'sz' + Date.now();
  const row = {
    id,
    name: size.name,
    balls: size.balls,
    price: size.price,
    sort_order: size.sort_order || 0,
  };
  const { data, error } = await supabase
    .from('gelato_sizes')
    .insert(row)
    .select()
    .single();
  if (error) { console.error('addGelatoSize error:', error); return null; }
  return mapGelatoSizeFromDb(data);
}

async function updateGelatoSize(id, updates) {
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

async function deleteGelatoSize(id) {
  const { error } = await supabase
    .from('gelato_sizes')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteGelatoSize error:', error);
}

function mapGelatoSizeFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    balls: Number(row.balls),
    price: Number(row.price),
    sort_order: Number(row.sort_order || 0),
  };
}

// ---- Toppings ----
async function getToppings() {
  const { data, error } = await supabase
    .from('toppings')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getToppings error:', error); return []; }
  return (data || []).map(mapToppingFromDb);
}

async function addTopping(topping) {
  const id = 't' + Date.now();
  const row = { id, name: topping.name, price: topping.price };
  const { data, error } = await supabase
    .from('toppings')
    .insert(row)
    .select()
    .single();
  if (error) { console.error('addTopping error:', error); return null; }
  return mapToppingFromDb(data);
}

async function updateTopping(id, updates) {
  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.price !== undefined) row.price = updates.price;
  const { data, error } = await supabase
    .from('toppings')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateTopping error:', error); return null; }
  return mapToppingFromDb(data);
}

async function deleteTopping(id) {
  const { error } = await supabase
    .from('toppings')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteTopping error:', error);
}

function mapToppingFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
  };
}

// ---- Chocolate Boxes ----
async function getChocolateBoxes() {
  const { data, error } = await supabase
    .from('chocolate_boxes')
    .select('*')
    .order('units', { ascending: true });
  if (error) { console.error('getChocolateBoxes error:', error); return []; }
  return (data || []).map(mapChocolateBoxFromDb);
}

async function addChocolateBox(box) {
  const id = 'box' + Date.now();
  const row = { id, name: box.name, units: box.units, price: box.price };
  const { data, error } = await supabase
    .from('chocolate_boxes')
    .insert(row)
    .select()
    .single();
  if (error) { console.error('addChocolateBox error:', error); return null; }
  return mapChocolateBoxFromDb(data);
}

async function updateChocolateBox(id, updates) {
  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.units !== undefined) row.units = updates.units;
  if (updates.price !== undefined) row.price = updates.price;
  const { data, error } = await supabase
    .from('chocolate_boxes')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateChocolateBox error:', error); return null; }
  return mapChocolateBoxFromDb(data);
}

async function deleteChocolateBox(id) {
  const { error } = await supabase
    .from('chocolate_boxes')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteChocolateBox error:', error);
}

function mapChocolateBoxFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    units: Number(row.units),
    price: Number(row.price),
  };
}

// ---- Utilities ----
function formatPrice(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Sem mais necessidade de initData() - os dados sao populados via SQL seed
async function initData() {
  // No-op: dados ja existem no Supabase via script SQL
  return;
}
