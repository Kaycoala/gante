// ============================================
// GANTE — Admin Dashboard Logic (Supabase)
// ============================================

const ADMIN_PASSWORD = 'gante2024';
let pendingDelete = null;
let _dashboardInitialized = false;

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
  // Only bind event listeners once to prevent duplicate handlers
  if (!_dashboardInitialized) {
    initSidebarNav();
    initMobileSidebar();
    initProductModal();
    initDiversosModal();
    initCategoryModal();
    initDeleteModal();
    initSearch();
    initAddButtons();
    initImageUpload();
    initFlavorsOfDayBtn();
    _dashboardInitialized = true;
  }

  // Data rendering can be called multiple times safely
  try { await renderGelatoTable(); } catch (e) { console.error('[v0] renderGelatoTable error:', e); }
  try { await renderChocolateTable(); } catch (e) { console.error('[v0] renderChocolateTable error:', e); }
  try { await renderDiversosTable(); } catch (e) { console.error('[v0] renderDiversosTable error:', e); }
  try { await renderSoftTable(); } catch (e) { console.error('[v0] renderSoftTable error:', e); }
  try { await renderAcaiTable(); } catch (e) { console.error('[v0] renderAcaiTable error:', e); }
  try { await renderCategoryTables(); } catch (e) { console.error('[v0] renderCategoryTables error:', e); }
  try { await renderFlavorsOfDay(); } catch (e) { console.error('[v0] renderFlavorsOfDay error:', e); }
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

// ---- Image Upload System ----
function initImageUpload() {
  // Inicializar area de upload do modal de produtos
  initUploadArea({
    areaId: 'prodImageUploadArea',
    fileInputId: 'prodImageUpload',
    pathInputId: 'prodImagePath',
    previewWrapId: 'imagePreviewWrap',
    previewImgId: 'imagePreview',
    placeholderId: 'imageUploadPlaceholder',
    progressId: 'imageUploadProgress',
    progressFillId: 'imageProgressFill',
    progressTextId: 'imageProgressText',
    removeBtnId: 'prodImageRemoveBtn',
  });

  // Inicializar area de upload do modal de diversos
  initUploadArea({
    areaId: 'divImageUploadArea',
    fileInputId: 'divImageUpload',
    pathInputId: 'divImagePath',
    previewWrapId: 'divImagePreviewWrap',
    previewImgId: 'divImagePreview',
    placeholderId: 'divImageUploadPlaceholder',
    progressId: 'divImageUploadProgress',
    progressFillId: 'divImageProgressFill',
    progressTextId: 'divImageProgressText',
    removeBtnId: 'divImageRemoveBtn',
  });
}

function initUploadArea(config) {
  const area = document.getElementById(config.areaId);
  const fileInput = document.getElementById(config.fileInputId);
  const pathInput = document.getElementById(config.pathInputId);
  const previewWrap = document.getElementById(config.previewWrapId);
  const previewImg = document.getElementById(config.previewImgId);
  const placeholder = document.getElementById(config.placeholderId);
  const progress = document.getElementById(config.progressId);
  const progressFill = document.getElementById(config.progressFillId);
  const progressText = document.getElementById(config.progressTextId);
  const removeBtn = document.getElementById(config.removeBtnId);

  if (!area || !fileInput) return;

  // Clique na area abre seletor de arquivo
  placeholder.addEventListener('click', () => fileInput.click());

  // Drag and drop
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('dragover');
  });

  area.addEventListener('dragleave', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], config);
    }
  });

  // Selecao de arquivo
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0], config);
    }
  });

  // Botao remover
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearUploadArea(config);
    });
  }
}

function handleFileUpload(file, config) {
  const pathInput = document.getElementById(config.pathInputId);
  const previewWrap = document.getElementById(config.previewWrapId);
  const previewImg = document.getElementById(config.previewImgId);
  const placeholder = document.getElementById(config.placeholderId);
  const progress = document.getElementById(config.progressId);
  const progressFill = document.getElementById(config.progressFillId);
  const progressText = document.getElementById(config.progressTextId);

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showToast('Tipo de arquivo nao permitido. Use JPG, PNG, GIF ou WebP.', 'error');
    return;
  }

  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Arquivo muito grande. Maximo: 5MB.', 'error');
    return;
  }

  // Mostrar progresso
  placeholder.style.display = 'none';
  previewWrap.style.display = 'none';
  progress.style.display = 'flex';
  progressFill.style.width = '0%';
  progressText.textContent = 'Enviando...';

  const formData = new FormData();
  formData.append('image', file);

  const xhr = new XMLHttpRequest();

  // Funcao para mostrar erro
  function showUploadError(msg) {
    progress.style.display = 'none';
    placeholder.style.display = 'flex';
    showToast(msg || 'Erro ao enviar imagem.', 'error');
  }

  // Progresso do upload
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressFill.style.width = percent + '%';
      progressText.textContent = `Enviando... ${percent}%`;
    }
  });

  // Completar upload
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          // Sucesso - mostrar preview
          progress.style.display = 'none';
          previewImg.src = response.url;
          previewImg.onload = () => {
            previewWrap.style.display = 'flex';
          };
          pathInput.value = response.path;
          showToast('Imagem enviada com sucesso!');
        } else {
          showUploadError(response.error || 'Erro ao enviar imagem.');
        }
      } catch (parseErr) {
        showUploadError('Resposta invalida do servidor.');
      }
    } else {
      let errorMsg = 'Erro ao enviar imagem.';
      try {
        const response = JSON.parse(xhr.responseText);
        errorMsg = response.error || errorMsg;
      } catch (e) {}
      showUploadError(errorMsg);
    }
  });

  xhr.addEventListener('error', () => {
    showUploadError('Falha na conexao com o servidor.');
  });

  xhr.addEventListener('abort', () => {
    showUploadError('Upload cancelado.');
  });

  // Usar API_BASE se definido (em storage.js), senao usar /api
  const uploadUrl = (typeof API_BASE !== 'undefined' ? API_BASE : '/api') + '/upload.php';
  xhr.open('POST', uploadUrl);
  xhr.send(formData);
}

function clearUploadArea(config) {
  const fileInput = document.getElementById(config.fileInputId);
  const pathInput = document.getElementById(config.pathInputId);
  const previewWrap = document.getElementById(config.previewWrapId);
  const placeholder = document.getElementById(config.placeholderId);
  const progress = document.getElementById(config.progressId);

  fileInput.value = '';
  pathInput.value = '';
  previewWrap.style.display = 'none';
  progress.style.display = 'none';
  placeholder.style.display = 'flex';
}

function resetImageUpload() {
  clearUploadArea({
    fileInputId: 'prodImageUpload',
    pathInputId: 'prodImagePath',
    previewWrapId: 'imagePreviewWrap',
    placeholderId: 'imageUploadPlaceholder',
    progressId: 'imageUploadProgress',
  });
}

function resetDiversosImageUpload() {
  clearUploadArea({
    fileInputId: 'divImageUpload',
    pathInputId: 'divImagePath',
    previewWrapId: 'divImagePreviewWrap',
    placeholderId: 'divImageUploadPlaceholder',
    progressId: 'divImageUploadProgress',
  });
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

// ---- Linha Soft Table ----
async function renderSoftTable(search = '') {
  const tbody = document.getElementById('softTableBody');
  let products = await getProducts('soft');
  const categories = await getCategories('soft');

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
          <button class="btn-edit" onclick="editProduct('soft', '${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'soft', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum produto da Linha Soft encontrado.</td></tr>';
  }
}

// ---- Acai Table ----
async function renderAcaiTable(search = '') {
  const tbody = document.getElementById('acaiTableBody');
  let products = await getProducts('acai');
  const categories = await getCategories('acai');

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
          <button class="btn-edit" onclick="editProduct('acai', '${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'acai', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum produto de Acai encontrado.</td></tr>';
  }
}

// ---- Diversos Table ----
async function renderDiversosTable(search = '') {
  const tbody = document.getElementById('diversosTableBody');
  let products = await getProducts('diversos');
  const categories = await getCategories('diversos');

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
        <td><span class="category-pill">${cat ? cat.name : (p.category ? p.category : 'Sem categoria')}</span></td>
        <td style="font-weight:600;">${formatPrice(p.price)}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editDiversos('${p.id}')">Editar</button>
          <button class="btn-delete" onclick="requestDelete('product', 'diversos', '${p.id}', '${p.name}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(15,59,46,0.4);">Nenhum item de cafeteria encontrado.</td></tr>';
  }
}

function editDiversos(id) {
  openDiversosModal(id);
}

// ---- Category Tables ----
async function renderCategoryTables() {
  await renderCatTable('gelato', 'gelatoCatBody');
  await renderCatTable('chocolate', 'chocoCatBody');
  await renderCatTable('diversos', 'diversosCatBody');
  await renderCatTable('soft', 'softCatBody');
  await renderCatTable('acai', 'acaiCatBody');
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
  document.getElementById('softSearch').addEventListener('input', (e) => {
    renderSoftTable(e.target.value);
  });
  document.getElementById('acaiSearch').addEventListener('input', (e) => {
    renderAcaiTable(e.target.value);
  });
}

// ---- Add Buttons ----
function initAddButtons() {
  document.getElementById('addGelatoBtn').addEventListener('click', () => openProductModal('gelato'));
  document.getElementById('addChocolateBtn').addEventListener('click', () => openProductModal('chocolate'));
  document.getElementById('addDiversosBtn').addEventListener('click', () => openDiversosModal());
  document.getElementById('addSoftBtn').addEventListener('click', () => openProductModal('soft'));
  document.getElementById('addAcaiBtn').addEventListener('click', () => openProductModal('acai'));
  document.getElementById('addGelatoCatBtn').addEventListener('click', () => openCategoryModal('gelato'));
  document.getElementById('addChocoCatBtn').addEventListener('click', () => openCategoryModal('chocolate'));
  document.getElementById('addDiversosCatBtn').addEventListener('click', () => openCategoryModal('diversos'));
  document.getElementById('addSoftCatBtn').addEventListener('click', () => openCategoryModal('soft'));
  document.getElementById('addAcaiCatBtn').addEventListener('click', () => openCategoryModal('acai'));
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

    // Obter caminho da imagem do campo hidden (preenchido pelo upload)
    const imagePath = document.getElementById('prodImagePath').value.trim();

    const productData = {
      name: document.getElementById('prodName').value.trim(),
      description: document.getElementById('prodDescription').value.trim(),
      price: parseFloat(document.getElementById('prodPrice').value),
      category: document.getElementById('prodCategory').value,
      type: type,
      imageUrl: imagePath,
    };

    let result;
    if (editId) {
      result = await updateProduct(type, editId, productData);
      if (result) {
        showToast('Produto atualizado com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel atualizar o produto. Verifique a conexao com o banco.', 'error');
        return;
      }
    } else {
      result = await addProduct(type, productData);
      if (result) {
        showToast('Produto adicionado com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel adicionar o produto. Verifique a conexao com o banco.', 'error');
        return;
      }
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
    title.textContent = 'Editar ' + getDisplayTypeName(type);
    document.getElementById('prodEditId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCategory').value = product.category;

    // Se ja tem imagem, mostrar preview
    if (product.imageUrl && product.imageUrl.length > 0) {
      // Extrair o caminho relativo da imagem
      const relativePath = product.imageUrl.replace(/^https?:\/\/[^/]+\//, '');
      document.getElementById('prodImagePath').value = relativePath;
      
      // Usar URL absoluta para o preview
      const previewSrc = product.imageUrl.startsWith('http') ? product.imageUrl : ((typeof SITE_BASE_URL !== 'undefined' ? SITE_BASE_URL : 'https://ganteartesanal.com.br') + '/' + product.imageUrl);
      const previewImg = document.getElementById('imagePreview');
      const previewWrap = document.getElementById('imagePreviewWrap');
      const placeholder = document.getElementById('imageUploadPlaceholder');
      
      previewImg.src = previewSrc;
      previewImg.onload = () => {
        previewWrap.style.display = 'flex';
        placeholder.style.display = 'none';
      };
      previewImg.onerror = () => {
        previewWrap.style.display = 'none';
        placeholder.style.display = 'flex';
      };
    }
  } else {
    title.textContent = 'Novo ' + getDisplayTypeName(type);
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

  closeBtn.addEventListener('click', () => { closeModal('diversosModal'); resetDiversosImageUpload(); });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { closeModal('diversosModal'); resetDiversosImageUpload(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('divEditId').value;

    // Obter caminho da imagem do campo hidden (preenchido pelo upload)
    const imagePath = document.getElementById('divImagePath').value.trim();

    const productData = {
      name: document.getElementById('divName').value.trim(),
      description: document.getElementById('divDescription').value.trim(),
      price: parseFloat(document.getElementById('divPrice').value),
      category: document.getElementById('divCategory').value || null,
      type: 'diversos',
      imageUrl: imagePath,
    };

    let result;
    if (editId) {
      result = await updateProduct('diversos', editId, productData);
      if (result) {
        showToast('Item de cafeteria atualizado com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel atualizar o item. Verifique a conexao com o banco.', 'error');
        return;
      }
    } else {
      result = await addProduct('diversos', productData);
      if (result) {
        showToast('Item de cafeteria adicionado com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel adicionar o item. Verifique a conexao com o banco.', 'error');
        return;
      }
    }

    closeModal('diversosModal');
    resetDiversosImageUpload();
    await refreshTables();
  });
}

async function openDiversosModal(productId = null) {
  // Reset image upload primeiro
  resetDiversosImageUpload();
  const modal = document.getElementById('diversosModal');
  const title = document.getElementById('diversosModalTitle');
  const form = document.getElementById('diversosForm');
  const categorySelect = document.getElementById('divCategory');

  // Populate categories
  const categories = await getCategories('diversos');
  categorySelect.innerHTML = '<option value="">Sem categoria</option>' +
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  if (productId) {
    const product = await getProductById('diversos', productId);
    if (!product) return;
    title.textContent = 'Editar Item de Cafeteria';
    document.getElementById('divEditId').value = product.id;
    document.getElementById('divName').value = product.name;
    document.getElementById('divDescription').value = product.description;
    document.getElementById('divPrice').value = product.price;
    document.getElementById('divCategory').value = product.category || '';
    // Se ja tem imagem, mostrar preview
    if (product.imageUrl && product.imageUrl.length > 0) {
      const relativePath = product.imageUrl.replace(/^https?:\/\/[^/]+\//, '');
      document.getElementById('divImagePath').value = relativePath;
      
      const previewSrc = product.imageUrl.startsWith('http') ? product.imageUrl : ((typeof SITE_BASE_URL !== 'undefined' ? SITE_BASE_URL : 'https://ganteartesanal.com.br') + '/' + product.imageUrl);
      const previewImg = document.getElementById('divImagePreview');
      const previewWrap = document.getElementById('divImagePreviewWrap');
      const placeholder = document.getElementById('divImageUploadPlaceholder');
      
      previewImg.src = previewSrc;
      previewImg.onload = () => {
        previewWrap.style.display = 'flex';
        placeholder.style.display = 'none';
      };
      previewImg.onerror = () => {
        previewWrap.style.display = 'none';
        placeholder.style.display = 'flex';
      };
    }
  } else {
    title.textContent = 'Novo Item de Cafeteria';
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

    if (!name) {
      showToast('Digite o nome da categoria.', 'error');
      return;
    }

    if (!type) {
      showToast('ERRO: Tipo de categoria nao definido.', 'error');
      return;
    }

    console.log('[Gante] Salvando categoria - tipo:', type, '| nome:', name, '| editId:', editId);

    let result;
    if (editId) {
      result = await updateCategory(type, editId, { name });
      if (result) {
        showToast('Categoria atualizada com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel atualizar a categoria. Verifique a conexao.', 'error');
        return;
      }
    } else {
      result = await addCategory(type, { name });
      if (result) {
        showToast('Categoria adicionada com sucesso!');
      } else {
        showToast('ERRO: Nao foi possivel adicionar a categoria. Verifique a conexao com o banco.', 'error');
        return;
      }
    }

    closeModal('categoryModal');
    await refreshTables();
  });
}

// Mapeia o tipo interno para nome de exibicao
function getDisplayTypeName(type) {
  switch (type) {
    case 'gelato': return 'Gelato';
    case 'chocolate': return 'Chocolate';
    case 'diversos': return 'Cafeteria';
    case 'soft': return 'Linha Soft';
    case 'acai': return 'Acai';
    default: return type;
  }
}

async function openCategoryModal(type, catId = null) {
  const title = document.getElementById('categoryModalTitle');
  document.getElementById('catEditType').value = type;
  const displayName = getDisplayTypeName(type);

  if (catId) {
    const categories = await getCategories(type);
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    title.textContent = 'Editar Categoria (' + displayName + ')';
    document.getElementById('catEditId').value = cat.id;
    document.getElementById('catName').value = cat.name;
  } else {
    title.textContent = 'Nova Categoria (' + displayName + ')';
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
      try {
        if (pendingDelete.kind === 'product') {
          await deleteProduct(pendingDelete.type, pendingDelete.id);
          showToast('Produto excluido com sucesso!');
        } else {
          await deleteCategory(pendingDelete.type, pendingDelete.id);
          showToast('Categoria excluida com sucesso!');
        }
      } catch (err) {
        showToast('ERRO ao excluir. Verifique a conexao com o banco.', 'error');
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

// ---- Flavors of the Day ----
let _selectedFlavorsOfDay = [];

async function renderFlavorsOfDay() {
  const grid = document.getElementById('flavorsOfDayGrid');
  const allGelatos = await getProducts('gelato');
  let currentFlavors = [];

  try {
    currentFlavors = await getFlavorsOfTheDay();
  } catch (e) {
    // silently fail
  }

  const currentIds = currentFlavors.map(f => String(f.id));
  _selectedFlavorsOfDay = [...currentIds];

  grid.innerHTML = allGelatos.map(g => {
    const isSelected = currentIds.includes(String(g.id));
    const hasImg = g.imageUrl && g.imageUrl.length > 0;
    const hue = hashStringToHue(g.name);
    return `
      <div class="admin-flavor-day-item ${isSelected ? 'selected' : ''}" data-id="${g.id}">
        <div class="admin-flavor-day-check"></div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${hasImg
            ? `<img class="flavor-thumb" src="${g.imageUrl}" alt="${g.name}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">`
            : `<span style="width:24px;height:24px;border-radius:50%;background:hsl(${hue},25%,78%);display:inline-block;flex-shrink:0;"></span>`
          }
          <span style="font-weight:500;">${g.name}</span>
        </div>
      </div>
    `;
  }).join('');

  // Bind click
  grid.querySelectorAll('.admin-flavor-day-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const idx = _selectedFlavorsOfDay.indexOf(id);
      if (idx !== -1) {
        _selectedFlavorsOfDay.splice(idx, 1);
        item.classList.remove('selected');
      } else {
        _selectedFlavorsOfDay.push(id);
        item.classList.add('selected');
      }
    });
  });
}

function initFlavorsOfDayBtn() {
  document.getElementById('saveFlavorsOfDayBtn').addEventListener('click', async () => {
    const result = await setFlavorsOfTheDay(_selectedFlavorsOfDay);
    if (result) {
      showToast('Sabores do dia salvos com sucesso!');
    } else {
      showToast('ERRO: Nao foi possivel salvar os sabores do dia.', 'error');
    }
  });
}

// ---- Refresh ----
async function refreshTables() {
  await renderGelatoTable(document.getElementById('gelatoSearch').value);
  await renderChocolateTable(document.getElementById('chocolateSearch').value);
  await renderDiversosTable(document.getElementById('diversosSearch').value);
  await renderSoftTable(document.getElementById('softSearch').value);
  await renderAcaiTable(document.getElementById('acaiSearch').value);
  await renderCategoryTables();
  await renderFlavorsOfDay();
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
