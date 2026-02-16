// ============================================
// GANTE — Admin Dashboard Logic (Supabase)
// ============================================

const ADMIN_PASSWORD = 'gante2024';
let pendingDelete = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  initLogin();
  checkAuth();
});

// ---- Authentication ----
function initLogin() {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('gante_admin_auth', 'true');
      errorEl.classList.remove('show');
      showDashboard();
    } else {
      errorEl.classList.add('show');
      document.getElementById('loginPassword').value = '';
      document.getElementById('loginPassword').focus();
    }
  });
}

function checkAuth() {
  if (sessionStorage.getItem('gante_admin_auth') === 'true') {
    showDashboard();
  }
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').classList.add('active');
  initDashboard();
}

function logout() {
  sessionStorage.removeItem('gante_admin_auth');
  document.getElementById('adminDashboard').classList.remove('active');
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('loginPassword').value = '';
}

// ---- Dashboard Init ----
async function initDashboard() {
  initSidebarNav();
  initMobileSidebar();
  await renderGelatoTable();
  await renderChocolateTable();
  await renderDiversosTable();
  await renderCategoryTables();
  initProductModal();
  initDiversosModal();
  initCategoryModal();
  initDeleteModal();
  initSearch();
  initAddButtons();
  initImageUpload();
}

// ---- Sidebar Navigation ----
function initSidebarNav() {
  const navItems = document.querySelectorAll('.admin-nav-item[data-view]');
  const views = document.querySelectorAll('.admin-view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => v.style.display = 'none');
      const viewId = 'view' + capitalize(item.dataset.view);
      document.getElementById(viewId).style.display = 'block';

      // Close mobile sidebar
      document.getElementById('adminSidebar').classList.remove('open');
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function initMobileSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.getElementById('adminMain').addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

// ---- Image Filename Preview ----
function initImageUpload() {
  const fileInput = document.getElementById('prodImageFile');
  const previewWrap = document.getElementById('imagePreviewWrap');
  const previewImg = document.getElementById('imagePreview');

  // Mostra preview ao digitar o nome do arquivo
  fileInput.addEventListener('input', () => {
    const filename = fileInput.value.trim();
    if (filename) {
      const imagePath = 'images/produtos/' + filename;
      previewImg.src = imagePath;
      previewImg.onerror = () => {
        previewWrap.style.display = 'none';
      };
      previewImg.onload = () => {
        previewWrap.style.display = 'block';
      };
    } else {
      previewWrap.style.display = 'none';
    }
  });
}

function resetImageUpload() {
  document.getElementById('prodImageFile').value = '';
  document.getElementById('imagePreviewWrap').style.display = 'none';
}

// Gera hue a partir do nome (mesma funcao do main.js)
function hashStringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ---- Gelato Table ----
async function renderGelatoTable(search = '') {
  const tbody = document.getElementById('gelatoTableBody');
  let products = await getProducts('gelato');
  const categories = await getCategories('gelato');

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  tbody.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    const hasImg = p.imageUrl && p.imageUrl.length > 0;
    const hue = hashStringToHue(p.name);
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            ${hasImg
              ? `<img class="admin-product-thumb" src="${p.imageUrl}" alt="${p.name}">`
              : `<span class="admin-product-thumb-placeholder" style="background:hsl(${hue}, 25%, 78%)">${p.name.charAt(0)}</span>`
            }
            <strong>${p.name}</strong>
          </div>
        </td>
        <td><span class="category-pill">${cat ? cat.name : p.category}</span></td>
        <td style="font-weight:600;">${formatPrice(p.price)}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editProduct('gelato', '${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'gelato', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum gelato encontrado.</td></tr>';
  }
}

// ---- Chocolate Table ----
async function renderChocolateTable(search = '') {
  const tbody = document.getElementById('chocolateTableBody');
  let products = await getProducts('chocolate');
  const categories = await getCategories('chocolate');

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  tbody.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    const hasImg = p.imageUrl && p.imageUrl.length > 0;
    const hue = hashStringToHue(p.name);
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            ${hasImg
              ? `<img class="admin-product-thumb" src="${p.imageUrl}" alt="${p.name}">`
              : `<span class="admin-product-thumb-placeholder" style="background:hsl(${hue}, 25%, 78%)">${p.name.charAt(0)}</span>`
            }
            <strong>${p.name}</strong>
          </div>
        </td>
        <td><span class="category-pill">${cat ? cat.name : p.category}</span></td>
        <td style="font-weight:600;">${formatPrice(p.price)}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editProduct('chocolate', '${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'chocolate', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum chocolate encontrado.</td></tr>';
  }
}

// ---- Diversos Table ----
async function renderDiversosTable(search = '') {
  const tbody = document.getElementById('diversosTableBody');
  let products = await getProducts('diversos');

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  tbody.innerHTML = products.map(p => {
    const hasImg = p.imageUrl && p.imageUrl.length > 0;
    const hue = hashStringToHue(p.name);
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            ${hasImg
              ? `<img class="admin-product-thumb" src="${p.imageUrl}" alt="${p.name}">`
              : `<span class="admin-product-thumb-placeholder" style="background:hsl(${hue}, 25%, 78%)">${p.name.charAt(0)}</span>`
            }
            <strong>${p.name}</strong>
          </div>
        </td>
        <td style="max-width:300px; font-size:0.85rem; color:rgba(15,59,46,0.6);">${p.description || ''}</td>
        <td style="font-weight:600;">${formatPrice(p.price)}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editDiversos('${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'diversos', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum item diverso encontrado.</td></tr>';
  }
}

function editDiversos(id) {
  openDiversosModal(id);
}

// ---- Category Tables ----
async function renderCategoryTables() {
  await renderCatTable('gelato', 'gelatoCatBody');
  await renderCatTable('chocolate', 'chocoCatBody');
}

async function renderCatTable(type, bodyId) {
  const tbody = document.getElementById(bodyId);
  const categories = await getCategories(type);
  const products = await getProducts(type);

  tbody.innerHTML = categories.map(c => {
    const count = products.filter(p => p.category === c.id).length;
    return `
      <tr>
        <td><strong>${c.name}</strong> <small style="color:rgba(15,59,46,0.4);">(${count} produtos)</small></td>
        <td><code style="font-size:0.8rem; background:rgba(232,217,197,0.5); padding:2px 8px; border-radius:4px;">${c.id}</code></td>
        <td class="actions">
          <button class="btn-edit" onclick="editCategory('${type}', '${c.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('category', '${type}', '${c.id}', '${c.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:24px; color:rgba(15,59,46,0.4);">Nenhuma categoria.</td></tr>';
  }
}

// ---- Search ----
function initSearch() {
  document.getElementById('gelatoSearch').addEventListener('input', (e) => {
    renderGelatoTable(e.target.value);
  });
  document.getElementById('chocolateSearch').addEventListener('input', (e) => {
    renderChocolateTable(e.target.value);
  });
  document.getElementById('diversosSearch').addEventListener('input', (e) => {
    renderDiversosTable(e.target.value);
  });
}

// ---- Add Buttons ----
function initAddButtons() {
  document.getElementById('addGelatoBtn').addEventListener('click', () => openProductModal('gelato'));
  document.getElementById('addChocolateBtn').addEventListener('click', () => openProductModal('chocolate'));
  document.getElementById('addDiversosBtn').addEventListener('click', () => openDiversosModal());
  document.getElementById('addGelatoCatBtn').addEventListener('click', () => openCategoryModal('gelato'));
  document.getElementById('addChocoCatBtn').addEventListener('click', () => openCategoryModal('chocolate'));
}

// ---- Product Modal ----
function initProductModal() {
  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('productModalClose');
  const form = document.getElementById('productForm');

  closeBtn.addEventListener('click', () => { closeModal('productModal'); resetImageUpload(); });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { closeModal('productModal'); resetImageUpload(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('prodEditId').value;
    const type = document.getElementById('prodEditType').value;

    // Determinar nome do arquivo da imagem
    const imageFile = document.getElementById('prodImageFile').value.trim();
    const imageUrl = imageFile ? 'images/produtos/' + imageFile : '';

    const productData = {
      name: document.getElementById('prodName').value.trim(),
      description: document.getElementById('prodDescription').value.trim(),
      price: parseFloat(document.getElementById('prodPrice').value),
      category: document.getElementById('prodCategory').value,
      type: type,
      imageUrl: imageUrl,
    };

    if (editId) {
      await updateProduct(type, editId, productData);
      showToast('Produto atualizado com sucesso!');
    } else {
      await addProduct(type, productData);
      showToast('Produto adicionado com sucesso!');
    }

    closeModal('productModal');
    resetImageUpload();
    await refreshTables();
  });
}

async function openProductModal(type, productId = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');
  const categorySelect = document.getElementById('prodCategory');

  // Reset image upload
  resetImageUpload();

  // Populate categories
  const categories = await getCategories(type);
  categorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  document.getElementById('prodEditType').value = type;

  if (productId) {
    const product = await getProductById(type, productId);
    if (!product) return;
    title.textContent = 'Editar ' + (type === 'gelato' ? 'Gelato' : type === 'chocolate' ? 'Chocolate' : 'Produto');
    document.getElementById('prodEditId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCategory').value = product.category;

    // Se ja tem imagem, preencher o campo com o nome do arquivo
    if (product.imageUrl && product.imageUrl.length > 0) {
      // Extrair apenas o nome do arquivo do path (ex: "images/produtos/pistacchio.jpg" -> "pistacchio.jpg")
      const filename = product.imageUrl.replace(/^images\/produtos\//, '');
      document.getElementById('prodImageFile').value = filename;
      document.getElementById('imagePreview').src = product.imageUrl;
      document.getElementById('imagePreview').onload = () => {
        document.getElementById('imagePreviewWrap').style.display = 'block';
      };
      document.getElementById('imagePreview').onerror = () => {
        document.getElementById('imagePreviewWrap').style.display = 'none';
      };
    }
  } else {
    title.textContent = 'Novo ' + (type === 'gelato' ? 'Gelato' : type === 'chocolate' ? 'Chocolate' : 'Produto');
    document.getElementById('prodEditId').value = '';
    form.reset();
  }

  openModal('productModal');
}

function editProduct(type, id) {
  openProductModal(type, id);
}

// ---- Diversos Modal ----
function initDiversosModal() {
  const modal = document.getElementById('diversosModal');
  const closeBtn = document.getElementById('diversosModalClose');
  const form = document.getElementById('diversosForm');

  closeBtn.addEventListener('click', () => closeModal('diversosModal'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('diversosModal');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('divEditId').value;

    const imageFile = document.getElementById('divImageFile').value.trim();
    const imageUrl = imageFile ? 'images/produtos/' + imageFile : '';

    const productData = {
      name: document.getElementById('divName').value.trim(),
      description: document.getElementById('divDescription').value.trim(),
      price: parseFloat(document.getElementById('divPrice').value),
      type: 'diversos',
      imageUrl: imageUrl,
    };

    if (editId) {
      await updateProduct('diversos', editId, productData);
      showToast('Item diverso atualizado com sucesso!');
    } else {
      await addProduct('diversos', productData);
      showToast('Item diverso adicionado com sucesso!');
    }

    closeModal('diversosModal');
    await refreshTables();
  });
}

async function openDiversosModal(productId = null) {
  const modal = document.getElementById('diversosModal');
  const title = document.getElementById('diversosModalTitle');
  const form = document.getElementById('diversosForm');

  if (productId) {
    const product = await getProductById('diversos', productId);
    if (!product) return;
    title.textContent = 'Editar Item Diverso';
    document.getElementById('divEditId').value = product.id;
    document.getElementById('divName').value = product.name;
    document.getElementById('divDescription').value = product.description;
    document.getElementById('divPrice').value = product.price;
    if (product.imageUrl) {
      const filename = product.imageUrl.replace(/^images\/produtos\//, '');
      document.getElementById('divImageFile').value = filename;
    } else {
      document.getElementById('divImageFile').value = '';
    }
  } else {
    title.textContent = 'Novo Item Diverso';
    document.getElementById('divEditId').value = '';
    form.reset();
  }

  openModal('diversosModal');
}

// ---- Category Modal ----
function initCategoryModal() {
  const modal = document.getElementById('categoryModal');
  const closeBtn = document.getElementById('categoryModalClose');
  const form = document.getElementById('categoryForm');

  closeBtn.addEventListener('click', () => closeModal('categoryModal'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('categoryModal');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('catEditId').value;
    const type = document.getElementById('catEditType').value;
    const name = document.getElementById('catName').value.trim();

    if (editId) {
      await updateCategory(type, editId, { name });
      showToast('Categoria atualizada com sucesso!');
    } else {
      await addCategory(type, { name });
      showToast('Categoria adicionada com sucesso!');
    }

    closeModal('categoryModal');
    await refreshTables();
  });
}

async function openCategoryModal(type, catId = null) {
  const title = document.getElementById('categoryModalTitle');
  document.getElementById('catEditType').value = type;

  if (catId) {
    const categories = await getCategories(type);
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    title.textContent = 'Editar Categoria';
    document.getElementById('catEditId').value = cat.id;
    document.getElementById('catName').value = cat.name;
  } else {
    title.textContent = 'Nova Categoria (' + (type === 'gelato' ? 'Gelato' : 'Chocolate') + ')';
    document.getElementById('catEditId').value = '';
    document.getElementById('catName').value = '';
  }

  openModal('categoryModal');
}

function editCategory(type, id) {
  openCategoryModal(type, id);
}

// ---- Delete Modal ----
function initDeleteModal() {
  document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    closeModal('deleteModal');
    pendingDelete = null;
  });
  document.getElementById('deleteConfirmBtn').addEventListener('click', async () => {
    if (pendingDelete) {
      if (pendingDelete.kind === 'product') {
        await deleteProduct(pendingDelete.type, pendingDelete.id);
        showToast('Produto excluido com sucesso!');
      } else {
        await deleteCategory(pendingDelete.type, pendingDelete.id);
        showToast('Categoria excluida com sucesso!');
      }
      pendingDelete = null;
      closeModal('deleteModal');
      await refreshTables();
    }
  });

  document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeModal('deleteModal');
      pendingDelete = null;
    }
  });
}

function requestDelete(kind, type, id, name) {
  pendingDelete = { kind, type, id };
  document.getElementById('deleteMessage').textContent = `Tem certeza que deseja excluir "${name}"? Esta acao nao pode ser desfeita.`;
  openModal('deleteModal');
}

// ---- Modal Helpers ----
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Refresh ----
async function refreshTables() {
  await renderGelatoTable(document.getElementById('gelatoSearch').value);
  await renderChocolateTable(document.getElementById('chocolateSearch').value);
  await renderDiversosTable(document.getElementById('diversosSearch').value);
  await renderCategoryTables();
}

// ---- Toast ----
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ---- Util ----
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
