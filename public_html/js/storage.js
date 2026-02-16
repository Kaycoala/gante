// ============================================
// GANTE — CRUD Helpers (localStorage + Firebase)
// ============================================
//
// Este arquivo usa localStorage por padrao.
// Para usar Firebase, descomente os blocos marcados com
// "FIREBASE:" e comente os blocos marcados com "LOCALSTORAGE:".
// Certifique-se de ter configurado o firebase-config.js antes.
//
// COMO FUNCIONA O SISTEMA DE DADOS:
// 1. Os produtos "oficiais" ficam no data.js (SEED_GELATOS, SEED_CHOCOLATES, SEED_DIVERSOS)
// 2. No primeiro acesso, os dados do data.js sao copiados para o localStorage
// 3. O admin pode criar/editar/excluir produtos via painel (salva no localStorage)
// 4. Quando voce altera o data.js, incremente DATA_VERSION abaixo
// 5. No proximo carregamento, o sistema faz MERGE inteligente:
//    - Produtos do seed sao atualizados (preco, nome, descricao, etc)
//    - Imagens adicionadas pelo admin sao preservadas
//    - Produtos criados pelo admin (nao existentes no seed) sao mantidos
//    - Produtos removidos do seed sao removidos do localStorage

const STORAGE_KEYS = {
  GELATOS: 'gante_gelatos',
  CHOCOLATES: 'gante_chocolates',
  DIVERSOS: 'gante_diversos',
  GELATO_CATEGORIES: 'gante_gelato_categories',
  CHOCOLATE_CATEGORIES: 'gante_chocolate_categories',
  INITIALIZED: 'gante_initialized',
};

// ---- Initialization ----
// INCREMENTE este numero sempre que alterar produtos no data.js
// Isso forca o re-sync dos dados no proximo carregamento
const DATA_VERSION = '5';

// Funcao auxiliar para fazer merge inteligente de produtos
// - Atualiza dados do seed (preco, nome, descricao, categoria)
// - Preserva imageUrl se o admin ja adicionou uma imagem
// - Preserva produtos customizados criados pelo admin
// - Remove produtos que foram deletados do seed
function mergeProducts(seedProducts, existingProducts) {
  const merged = [];

  // 1. Para cada produto no seed, fazer update ou insert
  seedProducts.forEach(seed => {
    const existing = existingProducts.find(e => e.id === seed.id);
    if (existing) {
      // UPDATE: manter imagem do admin, mas atualizar o resto do seed
      merged.push({
        ...seed,
        imageUrl: existing.imageUrl || seed.imageUrl
      });
    } else {
      // INSERT: produto novo no seed
      merged.push({ ...seed });
    }
  });

  // 2. Manter produtos customizados criados pelo admin (nao existem no seed)
  existingProducts.forEach(existing => {
    const isInSeed = seedProducts.find(s => s.id === existing.id);
    if (!isInSeed) {
      merged.push(existing);
    }
  });

  return merged;
}

function initData() {
  const currentVersion = localStorage.getItem('gante_data_version');
  if (currentVersion === DATA_VERSION && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

  // Re-seed com nova estrutura (preserva imagens e produtos customizados)
  if (currentVersion && currentVersion !== DATA_VERSION) {
    const existingGelatos = JSON.parse(localStorage.getItem(STORAGE_KEYS.GELATOS) || '[]');
    const existingChocolates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHOCOLATES) || '[]');
    const existingDiversos = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIVERSOS) || '[]');

    localStorage.setItem(STORAGE_KEYS.GELATOS, JSON.stringify(mergeProducts(SEED_GELATOS, existingGelatos)));
    localStorage.setItem(STORAGE_KEYS.CHOCOLATES, JSON.stringify(mergeProducts(SEED_CHOCOLATES, existingChocolates)));
    localStorage.setItem(STORAGE_KEYS.DIVERSOS, JSON.stringify(mergeProducts(SEED_DIVERSOS, existingDiversos)));
  } else {
    // Primeiro acesso: carregar tudo do seed
    localStorage.setItem(STORAGE_KEYS.GELATOS, JSON.stringify(SEED_GELATOS));
    localStorage.setItem(STORAGE_KEYS.CHOCOLATES, JSON.stringify(SEED_CHOCOLATES));
    localStorage.setItem(STORAGE_KEYS.DIVERSOS, JSON.stringify(SEED_DIVERSOS));
  }

  // Categorias sempre sao atualizadas pelo seed (fonte da verdade)
  localStorage.setItem(STORAGE_KEYS.GELATO_CATEGORIES, JSON.stringify(GELATO_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.CHOCOLATE_CATEGORIES, JSON.stringify(CHOCOLATE_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  localStorage.setItem('gante_data_version', DATA_VERSION);
}

// ============================================
// FIREBASE: Funcoes para inicializar dados no Firestore
// ============================================
// Descomente o bloco abaixo para popular o Firestore
// com os dados iniciais (execute apenas uma vez).
//
// async function initDataFirebase() {
//   // Verifica se ja foi inicializado
//   const meta = await db.collection('meta').doc('init').get();
//   if (meta.exists) return;
//
//   const batch = db.batch();
//
//   // Gelatos
//   SEED_GELATOS.forEach(g => {
//     batch.set(gelatosCollection.doc(g.id), g);
//   });
//
//   // Chocolates
//   SEED_CHOCOLATES.forEach(c => {
//     batch.set(chocolatesCollection.doc(c.id), c);
//   });
//
//   // Categorias de Gelato
//   GELATO_CATEGORIES.forEach(cat => {
//     batch.set(gelatoCategoriesCollection.doc(cat.id), cat);
//   });
//
//   // Categorias de Chocolate
//   CHOCOLATE_CATEGORIES.forEach(cat => {
//     batch.set(chocolateCategoriesCollection.doc(cat.id), cat);
//   });
//
//   // Marcar como inicializado
//   batch.set(db.collection('meta').doc('init'), { done: true });
//
//   await batch.commit();
//   console.log('Dados iniciais salvos no Firestore!');
// }

// ---- Products (LOCALSTORAGE) ----
function getProducts(type) {
  let key;
  if (type === 'gelato') key = STORAGE_KEYS.GELATOS;
  else if (type === 'chocolate') key = STORAGE_KEYS.CHOCOLATES;
  else if (type === 'diversos') key = STORAGE_KEYS.DIVERSOS;
  else key = STORAGE_KEYS.GELATOS;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function getProductsByCategory(type, categoryId) {
  const products = getProducts(type);
  if (!categoryId || categoryId === 'todos') return products;
  return products.filter(p => p.category === categoryId);
}

function getProductById(type, id) {
  const products = getProducts(type);
  return products.find(p => p.id === id) || null;
}

function addProduct(type, product) {
  const products = getProducts(type);
  product.id = type.charAt(0) + Date.now();
  products.push(product);
  saveProducts(type, products);
  return product;
}

function updateProduct(type, id, updates) {
  const products = getProducts(type);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates, id };
  saveProducts(type, products);
  return products[idx];
}

function deleteProduct(type, id) {
  let products = getProducts(type);
  products = products.filter(p => p.id !== id);
  saveProducts(type, products);
}

function saveProducts(type, products) {
  let key;
  if (type === 'gelato') key = STORAGE_KEYS.GELATOS;
  else if (type === 'chocolate') key = STORAGE_KEYS.CHOCOLATES;
  else if (type === 'diversos') key = STORAGE_KEYS.DIVERSOS;
  else key = STORAGE_KEYS.GELATOS;
  localStorage.setItem(key, JSON.stringify(products));
}

// ============================================
// FIREBASE: Funcoes de Produtos para Firestore
// ============================================
// Descomente e substitua as funcoes acima para usar Firestore.
//
// async function getProducts(type) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   const snapshot = await collection.get();
//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// }
//
// async function getProductsByCategory(type, categoryId) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   if (!categoryId || categoryId === 'todos') {
//     const snapshot = await collection.get();
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   }
//   const snapshot = await collection.where('category', '==', categoryId).get();
//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// }
//
// async function getProductById(type, id) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   const doc = await collection.doc(id).get();
//   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// }
//
// async function addProduct(type, product) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   const docRef = await collection.add(product);
//   return { id: docRef.id, ...product };
// }
//
// async function updateProduct(type, id, updates) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   await collection.doc(id).update(updates);
//   return { id, ...updates };
// }
//
// async function deleteProduct(type, id) {
//   const collection = type === 'gelato' ? gelatosCollection : chocolatesCollection;
//   // Tambem deletar a imagem do Storage se existir
//   const doc = await collection.doc(id).get();
//   if (doc.exists && doc.data().imageUrl) {
//     try {
//       const imageRef = storage.refFromURL(doc.data().imageUrl);
//       await imageRef.delete();
//     } catch (e) {
//       console.warn('Imagem nao encontrada no Storage:', e);
//     }
//   }
//   await collection.doc(id).delete();
// }

// ============================================
// FIREBASE: Upload de Imagem para Storage
// ============================================
// Funcao para fazer upload de imagem de produto
//
// async function uploadProductImage(file, type, productId) {
//   const path = `produtos/${type}/${productId}_${Date.now()}.${file.name.split('.').pop()}`;
//   const ref = storage.ref().child(path);
//   const snapshot = await ref.put(file);
//   const url = await snapshot.ref.getDownloadURL();
//   return url;
// }
//
// async function deleteProductImage(imageUrl) {
//   if (!imageUrl) return;
//   try {
//     const imageRef = storage.refFromURL(imageUrl);
//     await imageRef.delete();
//   } catch (e) {
//     console.warn('Erro ao deletar imagem:', e);
//   }
// }

// ---- Categories (LOCALSTORAGE) ----
function getCategories(type) {
  const key = type === 'gelato' ? STORAGE_KEYS.GELATO_CATEGORIES : STORAGE_KEYS.CHOCOLATE_CATEGORIES;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function addCategory(type, category) {
  const categories = getCategories(type);
  category.id = category.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + Date.now();
  categories.push(category);
  saveCategories(type, categories);
  return category;
}

function updateCategory(type, id, updates) {
  const categories = getCategories(type);
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...updates, id };
  saveCategories(type, categories);
  return categories[idx];
}

function deleteCategory(type, id) {
  let categories = getCategories(type);
  categories = categories.filter(c => c.id !== id);
  saveCategories(type, categories);
}

function saveCategories(type, categories) {
  const key = type === 'gelato' ? STORAGE_KEYS.GELATO_CATEGORIES : STORAGE_KEYS.CHOCOLATE_CATEGORIES;
  localStorage.setItem(key, JSON.stringify(categories));
}

// ============================================
// FIREBASE: Funcoes de Categorias para Firestore
// ============================================
//
// async function getCategories(type) {
//   const collection = type === 'gelato'
//     ? gelatoCategoriesCollection
//     : chocolateCategoriesCollection;
//   const snapshot = await collection.get();
//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// }
//
// async function addCategory(type, category) {
//   const collection = type === 'gelato'
//     ? gelatoCategoriesCollection
//     : chocolateCategoriesCollection;
//   const docRef = await collection.add(category);
//   return { id: docRef.id, ...category };
// }
//
// async function updateCategory(type, id, updates) {
//   const collection = type === 'gelato'
//     ? gelatoCategoriesCollection
//     : chocolateCategoriesCollection;
//   await collection.doc(id).update(updates);
//   return { id, ...updates };
// }
//
// async function deleteCategory(type, id) {
//   const collection = type === 'gelato'
//     ? gelatoCategoriesCollection
//     : chocolateCategoriesCollection;
//   await collection.doc(id).delete();
// }

// ---- Utilities ----
function formatPrice(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ---- Upload de imagem local (converte para base64 no localStorage) ----
// Enquanto Firebase nao estiver ativo, imagens sao salvas em base64
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
