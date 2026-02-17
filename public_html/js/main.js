// ============================================
// GANTE — Main Public Site Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  await renderGelatoSection();
  await renderChocolateSection();
  await initOrderBuilder();
  initContactForm();
});

// ---- Navbar ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-admin-link)');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Scroll Animations (Intersection Observer) ----
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ---- Render Gelato Section ----
async function renderGelatoSection() {
  const filterBar = document.getElementById('gelatoFilters');
  const grid = document.getElementById('gelatoGrid');
  const categories = await getCategories('gelato');

  // Render filter buttons
  filterBar.innerHTML = `
    <button class="filter-btn active" data-filter="todos">Todos</button>
    ${categories.map(c => `<button class="filter-btn" data-filter="${c.id}">${c.name}</button>`).join('')}
  `;

  // Bind filter clicks
  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await renderGelatoCards(btn.dataset.filter);
    });
  });

  await renderGelatoCards('todos');
}

async function renderGelatoCards(filter) {
  const grid = document.getElementById('gelatoGrid');
  const products = await getProductsByCategory('gelato', filter);
  const categories = await getCategories('gelato');

  grid.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return createProductCard(p, cat);
  }).join('');
}

// ---- Render Chocolate Section ----
async function renderChocolateSection() {
  const filterBar = document.getElementById('chocolateFilters');
  const grid = document.getElementById('chocolateGrid');
  const categories = await getCategories('chocolate');

  filterBar.innerHTML = `
    <button class="filter-btn active" data-filter="todos">Todos</button>
    ${categories.map(c => `<button class="filter-btn" data-filter="${c.id}">${c.name}</button>`).join('')}
  `;

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await renderChocolateCards(btn.dataset.filter);
    });
  });

  await renderChocolateCards('todos');
}

async function renderChocolateCards(filter) {
  const grid = document.getElementById('chocolateGrid');
  const products = await getProductsByCategory('chocolate', filter);
  const categories = await getCategories('chocolate');

  grid.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return createProductCard(p, cat);
  }).join('');
}

// ---- Shared Product Card Template ----
function createProductCard(product, category) {
  const catName = category ? category.name.toLowerCase() : '';
  const isLimited = catName.includes('limitada') || catName.includes('sazonais') || catName.includes('sazonal');
  const hasImage = product.imageUrl && product.imageUrl.length > 0;
  const initial = product.name.charAt(0).toUpperCase();

  // Gera uma cor de fundo baseada no nome (para placeholder bonito)
  const hue = hashStringToHue(product.name);

  return `
    <div class="product-card">
      <div class="product-card-img">
        ${hasImage
          ? `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy">`
          : `<div class="product-placeholder" style="background: linear-gradient(135deg, hsl(${hue}, 25%, 85%), hsl(${hue}, 30%, 72%));">
              <span class="product-placeholder-initial">${initial}</span>
              <span class="product-placeholder-label">Sem foto</span>
            </div>`
        }
        ${isLimited ? '<span class="product-card-badge">Especial</span>' : ''}
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${category ? category.name : ''}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-card-footer">
          <span class="product-price">${formatPrice(product.price)} <small>/ un</small></span>
          <a href="#pedido" class="btn btn-sm btn-primary">Pedir</a>
        </div>
      </div>
    </div>
  `;
}

// Gera um hue (0-360) baseado no nome do produto para placeholder unico
function hashStringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ============================================
// ORDER BUILDER
// ============================================

let orderState = {
  items: [],
  // Gelato state
  gelatoSize: null,
  gelatoQty: 1,
  // Chocolate state
  selectedChocos: {}, // { chocolateId: quantity }
  // Diversos state
  selectedDiversos: {}, // { diversoId: quantity }
};

async function initOrderBuilder() {
  initOrderTabs();
  await renderGelatoSizes();
  await renderGelatoFlavorsToday();
  await renderChocolateChoices();
  await renderDiversosChoices();
  initQtyControls();
  initAddButtonsMain();
  initFinalizeButtons();
}

// Tabs
function initOrderTabs() {
  const tabs = document.querySelectorAll('.order-tab');
  const contents = document.querySelectorAll('.order-content');
  const tabMap = {
    gelato: 'orderGelato',
    chocolate: 'orderChocolate',
    diversos: 'orderDiversos',
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tabMap[tab.dataset.tab];
      if (targetId) document.getElementById(targetId).classList.add('active');
    });
  });
}

// Gelato Sizes
// Cache local dos tamanhos para uso no order builder
let _gelatoSizesCache = [];

async function renderGelatoSizes() {
  const container = document.getElementById('gelatoSizes');
  _gelatoSizesCache = await getGelatoSizes();

  container.innerHTML = _gelatoSizesCache.map((s, i) => `
    <div class="size-option ${i === 0 ? 'selected' : ''}" data-size="${s.id}">
      <strong>${s.name}</strong>
      <small>${s.balls} sabor${s.balls > 1 ? 'es' : ''}</small>
      <span class="size-price">${formatPrice(s.price)}</span>
    </div>
  `).join('');

  orderState.gelatoSize = _gelatoSizesCache[0] || null;
  updateCupPreview();

  container.querySelectorAll('.size-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      orderState.gelatoSize = _gelatoSizesCache.find(s => String(s.id) === opt.dataset.size);
      updateCupPreview();
    });
  });
}

// Cup image preview based on selected size
function updateCupPreview() {
  const previewEl = document.getElementById('gelatoCupPreview');
  const imgEl = document.getElementById('gelatoCupImage');
  const labelEl = document.getElementById('gelatoCupSizeName');

  if (!orderState.gelatoSize) {
    previewEl.style.display = 'none';
    return;
  }

  // Image path convention: images/copos/{size_id}.png
  // User will set the actual images later
  const sizeName = orderState.gelatoSize.name.toLowerCase().replace(/\s+/g, '-');
  const imagePath = `images/copos/${sizeName}.png`;

  imgEl.src = imagePath;
  imgEl.alt = `Copo ${orderState.gelatoSize.name}`;
  labelEl.textContent = orderState.gelatoSize.name;
  previewEl.style.display = 'flex';

  // Hide preview if image fails to load
  imgEl.onerror = () => {
    previewEl.style.display = 'none';
  };
  imgEl.onload = () => {
    previewEl.style.display = 'flex';
  };
}

// Sabores do dia (apenas exibicao - sem selecao)
async function renderGelatoFlavorsToday() {
  const container = document.getElementById('gelatoFlavorsTodayGrid');
  const section = document.getElementById('gelatoFlavorsToday');

  // Buscar sabores do dia da API
  let flavorsToday = [];
  try {
    flavorsToday = await getFlavorsOfTheDay();
  } catch (e) {
    // silently fail
  }

  if (flavorsToday.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = flavorsToday.map(f => {
    const hasImg = f.imageUrl && f.imageUrl.length > 0;
    const hue = hashStringToHue(f.name);
    return `
      <div class="flavor-today-item">
        ${hasImg
          ? `<img class="flavor-thumb" src="${f.imageUrl}" alt="${f.name}">`
          : `<span class="flavor-color" style="background:hsl(${hue}, 25%, 78%)"></span>`
        }
        <span class="flavor-today-name">${f.name}</span>
      </div>
    `;
  }).join('');
}

// Chocolate Choices (com quantidade por chocolate - sem limite)
async function renderChocolateChoices() {
  const container = document.getElementById('chocolateChoices');
  const chocos = await getProducts('chocolate');

  container.innerHTML = chocos.map(c => {
    const hasImg = c.imageUrl && c.imageUrl.length > 0;
    const hue = hashStringToHue(c.name);
    return `
      <div class="choco-choice-item" data-id="${c.id}">
        <div class="choco-choice-info">
          ${hasImg
            ? `<img class="flavor-thumb" src="${c.imageUrl}" alt="${c.name}">`
            : `<span class="flavor-color" style="background:hsl(${hue}, 25%, 78%)"></span>`
          }
          <span class="choco-choice-name">${c.name}</span>
          <span class="choco-choice-price">${formatPrice(c.price)}/un</span>
        </div>
        <div class="choco-qty-control">
          <button type="button" class="choco-qty-btn choco-qty-minus" data-id="${c.id}">-</button>
          <span class="choco-qty-value" data-id="${c.id}">0</span>
          <button type="button" class="choco-qty-btn choco-qty-plus" data-id="${c.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind + buttons (sem limite maximo)
  container.querySelectorAll('.choco-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      orderState.selectedChocos[id] = (orderState.selectedChocos[id] || 0) + 1;
      updateChocoSelection();
    });
  });

  // Bind - buttons
  container.querySelectorAll('.choco-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!orderState.selectedChocos[id] || orderState.selectedChocos[id] <= 0) return;
      orderState.selectedChocos[id] -= 1;
      if (orderState.selectedChocos[id] === 0) delete orderState.selectedChocos[id];
      updateChocoSelection();
    });
  });

  updateChocoSelection();
}

function getChocoTotalCount() {
  return Object.values(orderState.selectedChocos).reduce((sum, qty) => sum + qty, 0);
}

function updateChocoSelection() {
  const container = document.getElementById('chocolateChoices');

  container.querySelectorAll('.choco-choice-item').forEach(item => {
    const id = item.dataset.id;
    const qty = orderState.selectedChocos[id] || 0;
    const qtyDisplay = item.querySelector('.choco-qty-value[data-id="' + id + '"]');
    if (qtyDisplay) qtyDisplay.textContent = qty;

    item.classList.toggle('selected', qty > 0);
  });
}

// Diversos Choices (sem limite minimo/maximo, agrupados por categoria)
async function renderDiversosChoices() {
  const container = document.getElementById('diversosChoices');
  const diversos = await getProducts('diversos');
  const categories = await getCategories('diversos');

  // Group by category
  const grouped = {};
  const uncategorized = [];

  diversos.forEach(d => {
    if (d.category) {
      if (!grouped[d.category]) grouped[d.category] = [];
      grouped[d.category].push(d);
    } else {
      uncategorized.push(d);
    }
  });

  let html = '';

  // Render categorized items
  categories.forEach(cat => {
    const items = grouped[cat.id] || [];
    if (items.length === 0) return;
    html += `<div class="diversos-category-label">${cat.name}</div>`;
    html += items.map(d => renderDiversoItem(d)).join('');
  });

  // Render uncategorized items
  if (uncategorized.length > 0) {
    if (categories.length > 0 && Object.keys(grouped).length > 0) {
      html += `<div class="diversos-category-label">Outros</div>`;
    }
    html += uncategorized.map(d => renderDiversoItem(d)).join('');
  }

  container.innerHTML = html;

  bindDiversosQtyEvents(container);
  updateDiversosSelection();
}

function renderDiversoItem(d) {
  const hasImg = d.imageUrl && d.imageUrl.length > 0;
  const hue = hashStringToHue(d.name);
  return `
    <div class="choco-choice-item" data-id="${d.id}">
      <div class="choco-choice-info">
        ${hasImg
          ? `<img class="flavor-thumb" src="${d.imageUrl}" alt="${d.name}">`
          : `<span class="flavor-color" style="background:hsl(${hue}, 25%, 78%)"></span>`
        }
        <span class="choco-choice-name">${d.name}</span>
        <span class="choco-choice-price">${formatPrice(d.price)}/un</span>
      </div>
      <div class="choco-qty-control">
        <button type="button" class="choco-qty-btn diversos-qty-minus" data-id="${d.id}">-</button>
        <span class="choco-qty-value" data-id="${d.id}">0</span>
        <button type="button" class="choco-qty-btn diversos-qty-plus" data-id="${d.id}">+</button>
      </div>
    </div>
  `;
}

function bindDiversosQtyEvents(container) {
  container.querySelectorAll('.diversos-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      orderState.selectedDiversos[id] = (orderState.selectedDiversos[id] || 0) + 1;
      updateDiversosSelection();
    });
  });

  container.querySelectorAll('.diversos-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!orderState.selectedDiversos[id] || orderState.selectedDiversos[id] <= 0) return;
      orderState.selectedDiversos[id] -= 1;
      if (orderState.selectedDiversos[id] === 0) delete orderState.selectedDiversos[id];
      updateDiversosSelection();
    });
  });

  updateDiversosSelection();
}

function updateDiversosSelection() {
  const container = document.getElementById('diversosChoices');

  container.querySelectorAll('.choco-choice-item').forEach(item => {
    const id = item.dataset.id;
    const qty = orderState.selectedDiversos[id] || 0;
    const qtyDisplay = item.querySelector('.choco-qty-value[data-id="' + id + '"]');
    if (qtyDisplay) qtyDisplay.textContent = qty;

    item.classList.toggle('selected', qty > 0);
  });
}

// Quantity Controls (gelato qty removed - simple selection only)
function initQtyControls() {
  // Gelato qty is always 1 now (no qty selector)
  orderState.gelatoQty = 1;
}

// Add Buttons (Order Builder)
function initAddButtonsMain() {
  document.getElementById('addGelatoBtn').addEventListener('click', addGelatoToOrder);
  document.getElementById('addChocolateBtn').addEventListener('click', addChocolateToOrder);
  document.getElementById('addDiversosBtn').addEventListener('click', addDiversosToOrder);
}

async function addGelatoToOrder() {
  if (!orderState.gelatoSize) {
    showToast('Selecione um tamanho.', 'error');
    return;
  }

  const itemPrice = orderState.gelatoSize.price * orderState.gelatoQty;

  orderState.items.push({
    id: 'oi' + Date.now(),
    type: 'gelato',
    size: orderState.gelatoSize.name,
    qty: orderState.gelatoQty,
    price: itemPrice,
    description: `Gelato ${orderState.gelatoSize.name} (sabor a combinar via WhatsApp)`
  });

  orderState.gelatoQty = 1;

  updateOrderSummary();
  showToast('Gelato adicionado ao pedido!', 'success');
}

async function addChocolateToOrder() {
  const totalSelected = getChocoTotalCount();
  if (totalSelected === 0) {
    showToast('Selecione pelo menos um chocolate.', 'error');
    return;
  }

  const chocolates = await getProducts('chocolate');
  const chocoDescParts = [];
  let itemPrice = 0;

  for (const [id, qty] of Object.entries(orderState.selectedChocos)) {
    const c = chocolates.find(p => String(p.id) === String(id));
    const name = c ? c.name : id;
    const unitPrice = c ? c.price : 0;
    itemPrice += unitPrice * qty;
    chocoDescParts.push(qty > 1 ? `${name} (x${qty})` : name);
  }

  orderState.items.push({
    id: 'oi' + Date.now(),
    type: 'chocolate',
    chocolates: chocoDescParts,
    qty: totalSelected,
    price: itemPrice,
    description: `Chocolates - ${chocoDescParts.join(', ')}`
  });

  // Reset chocolate selections
  orderState.selectedChocos = {};
  updateChocoSelection();

  updateOrderSummary();
  showToast('Chocolates adicionados ao pedido!', 'success');
}

async function addDiversosToOrder() {
  const diversos = await getProducts('diversos');
  const totalSelected = Object.values(orderState.selectedDiversos).reduce((sum, qty) => sum + qty, 0);
  
  if (totalSelected === 0) {
    showToast('Selecione pelo menos um item.', 'error');
    return;
  }

  const descParts = [];
  let itemPrice = 0;

  for (const [id, qty] of Object.entries(orderState.selectedDiversos)) {
    const d = diversos.find(p => String(p.id) === String(id));
    const name = d ? d.name : id;
    const unitPrice = d ? d.price : 0;
    itemPrice += unitPrice * qty;
    descParts.push(qty > 1 ? `${name} (x${qty})` : name);
  }

  orderState.items.push({
    id: 'oi' + Date.now(),
    type: 'diversos',
    description: `Diversos - ${descParts.join(', ')}`,
    qty: totalSelected,
    price: itemPrice,
  });

  // Reset
  orderState.selectedDiversos = {};
  updateDiversosSelection();

  updateOrderSummary();
  showToast('Itens diversos adicionados ao pedido!', 'success');
}

// Update Order Summary (single panel)
function updateOrderSummary() {
  const itemsEl = document.getElementById('orderItems');
  const totalEl = document.getElementById('orderTotal');
  const valueEl = document.getElementById('totalValue');
  const btnEl = document.getElementById('finalizarBtn');

  if (orderState.items.length === 0) {
    itemsEl.innerHTML = `
      <div class="order-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p>Seu pedido esta vazio</p>
      </div>
    `;
    totalEl.style.display = 'none';
    btnEl.style.display = 'none';
  } else {
    itemsEl.innerHTML = orderState.items.map(item => `
      <div class="order-item">
        <span class="order-item-name">${item.description}</span>
        <span style="font-weight:600; margin: 0 12px;">${formatPrice(item.price)}</span>
        <button class="order-item-remove" onclick="removeOrderItem('${item.id}')">Remover</button>
      </div>
    `).join('');
    
    const total = orderState.items.reduce((sum, item) => sum + item.price, 0);
    valueEl.textContent = formatPrice(total);
    totalEl.style.display = 'flex';
    btnEl.style.display = 'block';
  }
}

function removeOrderItem(id) {
  orderState.items = orderState.items.filter(item => item.id !== id);
  updateOrderSummary();
}

// Finalize
function initFinalizeButtons() {
  document.getElementById('finalizarBtn').addEventListener('click', openOrderModal);
  document.getElementById('modalClose').addEventListener('click', closeOrderModal);
  document.getElementById('orderModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrderModal();
  });
}

function openOrderModal() {
  const modal = document.getElementById('orderModal');
  const body = document.getElementById('modalBody');
  const total = orderState.items.reduce((sum, item) => sum + item.price, 0);

  body.innerHTML = `
    <div style="margin-bottom:24px;">
      ${orderState.items.map(item => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(232,217,197,0.5); font-size:0.9rem;">
          <span>${item.description}</span>
          <span style="font-weight:600; white-space:nowrap; margin-left:12px;">${formatPrice(item.price)}</span>
        </div>
      `).join('')}
      <div style="display:flex; justify-content:space-between; padding:16px 0 0; font-family:var(--font-heading); font-size:1.3rem; font-weight:700; border-top:2px solid var(--color-primary); margin-top:8px;">
        <span>Total</span>
        <span>${formatPrice(total)}</span>
      </div>
    </div>

    <div class="form-group">
      <label for="customerName">Seu Nome *</label>
      <input type="text" id="customerName" placeholder="Digite seu nome" required>
    </div>

    <div class="form-group">
      <label for="customerPhone">Seu Telefone *</label>
      <input type="tel" id="customerPhone" placeholder="(00) 00000-0000" required>
    </div>

    <div class="form-group">
      <label>Forma de Recebimento *</label>
      <div style="display:flex; gap:12px; margin-top:6px;">
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.95rem; font-weight:500; color:var(--color-primary);">
          <input type="radio" name="deliveryOption" value="retirada" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
          Retirar na loja
        </label>
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.95rem; font-weight:500; color:var(--color-primary);">
          <input type="radio" name="deliveryOption" value="entrega" style="accent-color:var(--color-primary); width:18px; height:18px;">
          Entrega (+R$ 7,00)
        </label>
      </div>
    </div>

    <div class="form-group" id="deliveryAddressGroup" style="display:none;">
      <label for="deliveryAddress">Endereco de Entrega *</label>
      <input type="text" id="deliveryAddress" placeholder="Rua, numero, bairro">
    </div>

    <div id="deliveryFeeInfo" style="display:none; background:rgba(232,217,197,0.3); border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:0.9rem; color:var(--color-primary);">
      Taxa de entrega: <strong>R$ 7,00</strong>
    </div>

    <button class="btn btn-whatsapp" style="width:100%;" onclick="sendToWhatsApp()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Enviar Pedido pelo WhatsApp
    </button>
    <p style="text-align:center; margin-top:12px; font-size:0.8rem; color:rgba(15,59,46,0.5);">
      Voce sera redirecionado para o WhatsApp com o resumo do pedido.
    </p>
  `;

  // Bind delivery option toggle
  document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isDelivery = radio.value === 'entrega' && radio.checked;
      document.getElementById('deliveryAddressGroup').style.display = isDelivery ? 'block' : 'none';
      document.getElementById('deliveryFeeInfo').style.display = isDelivery ? 'block' : 'none';
    });
  });

  // Mascara simples de telefone
  const phoneInput = document.getElementById('customerPhone');
  phoneInput.addEventListener('input', () => {
    let v = phoneInput.value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 6) {
      v = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`;
    } else if (v.length > 2) {
      v = `(${v.substring(0,2)}) ${v.substring(2)}`;
    }
    phoneInput.value = v;
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

function sendToWhatsApp() {
  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('customerPhone');
  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
  const isDelivery = deliveryOption && deliveryOption.value === 'entrega';
  const addressInput = document.getElementById('deliveryAddress');
  const address = addressInput ? addressInput.value.trim() : '';

  // Validacoes
  let hasError = false;

  if (!name) {
    nameInput.style.borderColor = 'var(--color-error)';
    if (!hasError) nameInput.focus();
    hasError = true;
  } else {
    nameInput.style.borderColor = '';
  }

  if (!phone || phone.replace(/\D/g, '').length < 10) {
    phoneInput.style.borderColor = 'var(--color-error)';
    if (!hasError) phoneInput.focus();
    hasError = true;
  } else {
    phoneInput.style.borderColor = '';
  }

  if (isDelivery && !address) {
    addressInput.style.borderColor = 'var(--color-error)';
    if (!hasError) addressInput.focus();
    hasError = true;
  } else if (addressInput) {
    addressInput.style.borderColor = '';
  }

  if (hasError) return;

  const deliveryFee = isDelivery ? 7 : 0;
  const subtotal = orderState.items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + deliveryFee;

  // Montar mensagem para WhatsApp
  let message = `*Pedido Gante Gelato & Chocolates*\n\n`;
  message += `*Cliente:* ${name}\n`;
  message += `*Telefone:* ${phone}\n`;
  message += `*Recebimento:* ${isDelivery ? 'Entrega' : 'Retirada na loja'}\n`;
  if (isDelivery) {
    message += `*Endereco:* ${address}\n`;
  }
  message += `-----------------------------------\n\n`;

  orderState.items.forEach((item, index) => {
    message += `*${index + 1}.* ${item.description}\n`;
    message += `   Valor: ${formatPrice(item.price)}\n\n`;
  });

  message += `-----------------------------------\n`;
  if (isDelivery) {
    message += `Subtotal: ${formatPrice(subtotal)}\n`;
    message += `Taxa de entrega: ${formatPrice(deliveryFee)}\n`;
  }
  message += `*TOTAL: ${formatPrice(total)}*\n\n`;
  message += `Obrigado pela preferencia!`;

  // Codificar para URL
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // Mostrar confirmacao antes de redirecionar
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="confirmation-content">
      <div class="confirmation-icon" style="background:rgba(37,211,102,0.1);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </div>
      <h3>Redirecionando para o WhatsApp...</h3>
      <p>Seu pedido esta sendo enviado. Se nao abrir automaticamente, clique no botao abaixo.</p>
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="margin-bottom:12px;">
        Abrir WhatsApp
      </a>
      <br>
      <button class="btn btn-secondary btn-sm" onclick="closeOrderModal(); resetOrder();">Fechar</button>
    </div>
  `;

  // Abrir WhatsApp automaticamente
  window.open(whatsappUrl, '_blank');
}

function resetOrder() {
  orderState.items = [];
  orderState.selectedChocos = {};
  orderState.selectedDiversos = {};
  orderState.gelatoQty = 1;
  updateChocoSelection();
  updateDiversosSelection();
  updateOrderSummary();
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Name
    const name = document.getElementById('contactName');
    const nameGroup = name.closest('.form-group');
    if (!name.value.trim()) {
      nameGroup.classList.add('has-error');
      isValid = false;
    } else {
      nameGroup.classList.remove('has-error');
    }

    // Email
    const email = document.getElementById('contactEmail');
    const emailGroup = email.closest('.form-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      emailGroup.classList.add('has-error');
      isValid = false;
    } else {
      emailGroup.classList.remove('has-error');
    }

    // Message
    const message = document.getElementById('contactMessage');
    const messageGroup = message.closest('.form-group');
    if (!message.value.trim()) {
      messageGroup.classList.add('has-error');
      isValid = false;
    } else {
      messageGroup.classList.remove('has-error');
    }

    if (isValid) {
      form.reset();
      showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
    }
  });
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
