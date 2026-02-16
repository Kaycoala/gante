// ============================================
// GANTE — Main Public Site Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initData();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  renderGelatoSection();
  renderChocolateSection();
  initOrderBuilder();
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
function renderGelatoSection() {
  const filterBar = document.getElementById('gelatoFilters');
  const grid = document.getElementById('gelatoGrid');
  const categories = getCategories('gelato');

  // Render filter buttons
  filterBar.innerHTML = `
    <button class="filter-btn active" data-filter="todos">Todos</button>
    ${categories.map(c => `<button class="filter-btn" data-filter="${c.id}">${c.name}</button>`).join('')}
  `;

  // Bind filter clicks
  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGelatoCards(btn.dataset.filter);
    });
  });

  renderGelatoCards('todos');
}

function renderGelatoCards(filter) {
  const grid = document.getElementById('gelatoGrid');
  const products = getProductsByCategory('gelato', filter);
  const categories = getCategories('gelato');

  grid.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return createProductCard(p, cat);
  }).join('');
}

// ---- Render Chocolate Section ----
function renderChocolateSection() {
  const filterBar = document.getElementById('chocolateFilters');
  const grid = document.getElementById('chocolateGrid');
  const categories = getCategories('chocolate');

  filterBar.innerHTML = `
    <button class="filter-btn active" data-filter="todos">Todos</button>
    ${categories.map(c => `<button class="filter-btn" data-filter="${c.id}">${c.name}</button>`).join('')}
  `;

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderChocolateCards(btn.dataset.filter);
    });
  });

  renderChocolateCards('todos');
}

function renderChocolateCards(filter) {
  const grid = document.getElementById('chocolateGrid');
  const products = getProductsByCategory('chocolate', filter);
  const categories = getCategories('chocolate');

  grid.innerHTML = products.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return createProductCard(p, cat);
  }).join('');
}

// ---- Shared Product Card Template ----
function createProductCard(product, category) {
  const isLimited = product.category === 'limitada' || product.category === 'sazonais';
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
  selectedFlavors: {}, // { flavorId: quantity }
  selectedToppings: [],
  gelatoQty: 1,
  // Chocolate state
  chocoBox: null,
  selectedChocos: {}, // { chocolateId: quantity }
  chocoQty: 1,
};

function initOrderBuilder() {
  initOrderTabs();
  renderGelatoSizes();
  renderGelatoFlavors();
  renderToppings();
  renderChocolateBoxes();
  renderChocolateChoices();
  initQtyControls();
  initAddButtons();
  initFinalizeButtons();
}

// Tabs
function initOrderTabs() {
  const tabs = document.querySelectorAll('.order-tab');
  const contents = document.querySelectorAll('.order-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab === 'gelato' ? 'orderGelato' : 'orderChocolate').classList.add('active');
    });
  });
}

// Gelato Sizes
function renderGelatoSizes() {
  const container = document.getElementById('gelatoSizes');
  container.innerHTML = GELATO_SIZES.map((s, i) => `
    <div class="size-option ${i === 0 ? 'selected' : ''}" data-size="${s.id}">
      <strong>${s.name}</strong>
      <small>${s.balls} bola${s.balls > 1 ? 's' : ''}</small>
      <span class="size-price">${formatPrice(s.price)}</span>
    </div>
  `).join('');

  orderState.gelatoSize = GELATO_SIZES[0];

  container.querySelectorAll('.size-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      orderState.gelatoSize = GELATO_SIZES.find(s => s.id === opt.dataset.size);
      orderState.selectedFlavors = {};
      updateFlavorSelection();
    });
  });
}

// Gelato Flavors (com quantidade por sabor)
function renderGelatoFlavors() {
  const container = document.getElementById('gelatoFlavors');
  const gelatos = getProducts('gelato');

  container.innerHTML = gelatos.map(g => {
    const hasImg = g.imageUrl && g.imageUrl.length > 0;
    const hue = hashStringToHue(g.name);
    return `
      <div class="choco-choice-item" data-id="${g.id}">
        <div class="choco-choice-info">
          ${hasImg
            ? `<img class="flavor-thumb" src="${g.imageUrl}" alt="${g.name}">`
            : `<span class="flavor-color" style="background:hsl(${hue}, 25%, 78%)"></span>`
          }
          <span class="choco-choice-name">${g.name}</span>
        </div>
        <div class="choco-qty-control">
          <button type="button" class="choco-qty-btn flavor-qty-minus" data-id="${g.id}">-</button>
          <span class="choco-qty-value flavor-qty-value" data-id="${g.id}">0</span>
          <button type="button" class="choco-qty-btn flavor-qty-plus" data-id="${g.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind + buttons
  container.querySelectorAll('.flavor-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const totalSelected = getFlavorTotalCount();
      const maxBalls = orderState.gelatoSize ? orderState.gelatoSize.balls : 1;
      if (totalSelected >= maxBalls) return;
      orderState.selectedFlavors[id] = (orderState.selectedFlavors[id] || 0) + 1;
      updateFlavorSelection();
    });
  });

  // Bind - buttons
  container.querySelectorAll('.flavor-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!orderState.selectedFlavors[id] || orderState.selectedFlavors[id] <= 0) return;
      orderState.selectedFlavors[id] -= 1;
      if (orderState.selectedFlavors[id] === 0) delete orderState.selectedFlavors[id];
      updateFlavorSelection();
    });
  });

  updateFlavorSelection();
}

function getFlavorTotalCount() {
  return Object.values(orderState.selectedFlavors).reduce((sum, qty) => sum + qty, 0);
}

function updateFlavorSelection() {
  const container = document.getElementById('gelatoFlavors');
  const maxFlavors = orderState.gelatoSize ? orderState.gelatoSize.balls : 1;
  const totalSelected = getFlavorTotalCount();
  const countEl = document.getElementById('flavorCount');
  countEl.textContent = `(${totalSelected}/${maxFlavors})`;
  const isFull = totalSelected >= maxFlavors;

  container.querySelectorAll('.choco-choice-item').forEach(item => {
    const id = item.dataset.id;
    const qty = orderState.selectedFlavors[id] || 0;
    const qtyDisplay = item.querySelector('.flavor-qty-value[data-id="' + id + '"]');
    if (qtyDisplay) qtyDisplay.textContent = qty;

    item.classList.toggle('selected', qty > 0);

    // Desabilitar botao + se slots estao cheios
    const plusBtn = item.querySelector('.flavor-qty-plus');
    if (plusBtn) {
      plusBtn.disabled = isFull;
      plusBtn.classList.toggle('disabled', isFull);
    }
  });
}

// Toppings
function renderToppings() {
  const container = document.getElementById('toppingsGrid');
  container.innerHTML = TOPPINGS.map(t => `
    <div class="topping-item" data-id="${t.id}">
      ${t.name} (+${formatPrice(t.price)})
    </div>
  `).join('');

  container.querySelectorAll('.topping-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      if (orderState.selectedToppings.includes(id)) {
        orderState.selectedToppings = orderState.selectedToppings.filter(t => t !== id);
      } else {
        orderState.selectedToppings.push(id);
      }
      item.classList.toggle('selected');
    });
  });
}

// Chocolate Boxes
function renderChocolateBoxes() {
  const container = document.getElementById('chocolateBoxes');
  container.innerHTML = CHOCOLATE_BOXES.map((b, i) => `
    <div class="size-option ${i === 0 ? 'selected' : ''}" data-box="${b.id}">
      <strong>${b.name}</strong>
      <small>${b.units} unidades</small>
      <span class="size-price">${formatPrice(b.price)}</span>
    </div>
  `).join('');

  orderState.chocoBox = CHOCOLATE_BOXES[0];

  container.querySelectorAll('.size-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      orderState.chocoBox = CHOCOLATE_BOXES.find(b => b.id === opt.dataset.box);
      orderState.selectedChocos = {};
      updateChocoSelection();
    });
  });
}

// Chocolate Choices (com quantidade por chocolate)
function renderChocolateChoices() {
  const container = document.getElementById('chocolateChoices');
  const chocos = getProducts('chocolate').filter(c => 
    c.category === 'trufas' || c.category === 'drageas'
  );

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
        </div>
        <div class="choco-qty-control">
          <button type="button" class="choco-qty-btn choco-qty-minus" data-id="${c.id}">-</button>
          <span class="choco-qty-value" data-id="${c.id}">0</span>
          <button type="button" class="choco-qty-btn choco-qty-plus" data-id="${c.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind + buttons
  container.querySelectorAll('.choco-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const totalSelected = getChocoTotalCount();
      const maxUnits = orderState.chocoBox ? orderState.chocoBox.units : 6;
      if (totalSelected >= maxUnits) return;
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
  const maxChocos = orderState.chocoBox ? orderState.chocoBox.units : 6;
  const totalSelected = getChocoTotalCount();
  const countEl = document.getElementById('chocoCount');
  countEl.textContent = `(${totalSelected}/${maxChocos})`;
  const isFull = totalSelected >= maxChocos;

  container.querySelectorAll('.choco-choice-item').forEach(item => {
    const id = item.dataset.id;
    const qty = orderState.selectedChocos[id] || 0;
    const qtyDisplay = item.querySelector('.choco-qty-value[data-id="' + id + '"]');
    if (qtyDisplay) qtyDisplay.textContent = qty;

    item.classList.toggle('selected', qty > 0);

    // Desabilitar botao + se caixa esta cheia
    const plusBtn = item.querySelector('.choco-qty-plus');
    if (plusBtn) {
      plusBtn.disabled = isFull;
      plusBtn.classList.toggle('disabled', isFull);
    }
  });
}

// Quantity Controls
function initQtyControls() {
  // Gelato
  const gelatoQtyInput = document.getElementById('gelatoQty');
  document.getElementById('gelatoQtyMinus').addEventListener('click', () => {
    orderState.gelatoQty = Math.max(1, orderState.gelatoQty - 1);
    gelatoQtyInput.value = orderState.gelatoQty;
  });
  document.getElementById('gelatoQtyPlus').addEventListener('click', () => {
    orderState.gelatoQty = Math.min(20, orderState.gelatoQty + 1);
    gelatoQtyInput.value = orderState.gelatoQty;
  });

  // Chocolate
  const chocoQtyInput = document.getElementById('chocoQty');
  document.getElementById('chocoQtyMinus').addEventListener('click', () => {
    orderState.chocoQty = Math.max(1, orderState.chocoQty - 1);
    chocoQtyInput.value = orderState.chocoQty;
  });
  document.getElementById('chocoQtyPlus').addEventListener('click', () => {
    orderState.chocoQty = Math.min(20, orderState.chocoQty + 1);
    chocoQtyInput.value = orderState.chocoQty;
  });
}

// Add Buttons
function initAddButtons() {
  document.getElementById('addGelatoBtn').addEventListener('click', addGelatoToOrder);
  document.getElementById('addChocolateBtn').addEventListener('click', addChocolateToOrder);
}

function addGelatoToOrder() {
  if (!orderState.gelatoSize) {
    showToast('Selecione um tamanho.', 'error');
    return;
  }
  const totalSelected = getFlavorTotalCount();
  if (totalSelected === 0) {
    showToast('Selecione pelo menos um sabor.', 'error');
    return;
  }
  if (totalSelected !== orderState.gelatoSize.balls) {
    showToast(`Selecione exatamente ${orderState.gelatoSize.balls} bola${orderState.gelatoSize.balls > 1 ? 's' : ''} para este tamanho. Voce selecionou ${totalSelected}.`, 'error');
    return;
  }

  const gelatos = getProducts('gelato');
  const flavorDescParts = [];
  for (const [id, qty] of Object.entries(orderState.selectedFlavors)) {
    const g = gelatos.find(p => p.id === id);
    const name = g ? g.name : id;
    flavorDescParts.push(qty > 1 ? `${name} (x${qty})` : name);
  }

  const toppingNames = orderState.selectedToppings.map(id => {
    const t = TOPPINGS.find(tp => tp.id === id);
    return t ? t.name : id;
  });

  const toppingCost = orderState.selectedToppings.reduce((sum, id) => {
    const t = TOPPINGS.find(tp => tp.id === id);
    return sum + (t ? t.price : 0);
  }, 0);

  const itemPrice = (orderState.gelatoSize.price + toppingCost) * orderState.gelatoQty;

  orderState.items.push({
    id: 'oi' + Date.now(),
    type: 'gelato',
    size: orderState.gelatoSize.name,
    flavors: flavorDescParts,
    toppings: toppingNames,
    qty: orderState.gelatoQty,
    price: itemPrice,
    description: `Gelato ${orderState.gelatoSize.name} - ${flavorDescParts.join(', ')}${toppingNames.length > 0 ? ' + ' + toppingNames.join(', ') : ''} (x${orderState.gelatoQty})`
  });

  // Reset gelato selections
  orderState.selectedFlavors = {};
  orderState.selectedToppings = [];
  orderState.gelatoQty = 1;
  document.getElementById('gelatoQty').value = 1;
  updateFlavorSelection();
  document.querySelectorAll('#toppingsGrid .topping-item').forEach(i => i.classList.remove('selected'));

  updateOrderSummary();
  showToast('Gelato adicionado ao pedido!', 'success');
}

function addChocolateToOrder() {
  if (!orderState.chocoBox) {
    showToast('Selecione uma caixa.', 'error');
    return;
  }
  const totalSelected = getChocoTotalCount();
  if (totalSelected === 0) {
    showToast('Selecione pelo menos um chocolate.', 'error');
    return;
  }
  if (totalSelected !== orderState.chocoBox.units) {
    showToast(`Selecione exatamente ${orderState.chocoBox.units} unidades para esta caixa. Voce selecionou ${totalSelected}.`, 'error');
    return;
  }

  const chocolates = getProducts('chocolate');
  const chocoDescParts = [];
  for (const [id, qty] of Object.entries(orderState.selectedChocos)) {
    const c = chocolates.find(p => p.id === id);
    const name = c ? c.name : id;
    chocoDescParts.push(qty > 1 ? `${name} (x${qty})` : name);
  }

  const itemPrice = orderState.chocoBox.price * orderState.chocoQty;

  orderState.items.push({
    id: 'oi' + Date.now(),
    type: 'chocolate',
    box: orderState.chocoBox.name,
    chocolates: chocoDescParts,
    qty: orderState.chocoQty,
    price: itemPrice,
    description: `${orderState.chocoBox.name} (${orderState.chocoBox.units}un) - ${chocoDescParts.join(', ')} (x${orderState.chocoQty})`
  });

  // Reset chocolate selections
  orderState.selectedChocos = {};
  orderState.chocoQty = 1;
  document.getElementById('chocoQty').value = 1;
  updateChocoSelection();

  updateOrderSummary();
  showToast('Caixa de chocolates adicionada!', 'success');
}

// Update Order Summary (both panels)
function updateOrderSummary() {
  const panels = [
    { items: 'orderItems', total: 'orderTotal', value: 'totalValue', btn: 'finalizarBtn' },
    { items: 'orderItems2', total: 'orderTotal2', value: 'totalValue2', btn: 'finalizarBtn2' },
  ];

  panels.forEach(panel => {
    const itemsEl = document.getElementById(panel.items);
    const totalEl = document.getElementById(panel.total);
    const valueEl = document.getElementById(panel.value);
    const btnEl = document.getElementById(panel.btn);

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
  });
}

function removeOrderItem(id) {
  orderState.items = orderState.items.filter(item => item.id !== id);
  updateOrderSummary();
}

// Finalize
function initFinalizeButtons() {
  document.getElementById('finalizarBtn').addEventListener('click', openOrderModal);
  document.getElementById('finalizarBtn2').addEventListener('click', openOrderModal);
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
      <label for="customerName">Seu Nome</label>
      <input type="text" id="customerName" placeholder="Digite seu nome" required>
    </div>

    <button class="btn btn-whatsapp" style="width:100%;" onclick="sendToWhatsApp()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Enviar Pedido pelo WhatsApp
    </button>
    <p style="text-align:center; margin-top:12px; font-size:0.8rem; color:rgba(15,59,46,0.5);">
      Voce sera redirecionado para o WhatsApp com o resumo do pedido.
    </p>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

function sendToWhatsApp() {
  const nameInput = document.getElementById('customerName');
  const name = nameInput ? nameInput.value.trim() : '';

  if (!name) {
    nameInput.style.borderColor = 'var(--color-error)';
    nameInput.focus();
    return;
  }

  const total = orderState.items.reduce((sum, item) => sum + item.price, 0);

  // Montar mensagem para WhatsApp
  let message = `*Pedido Gante Gelato & Chocolates*\n\n`;
  message += `*Cliente:* ${name}\n`;
  message += `-----------------------------------\n\n`;

  orderState.items.forEach((item, index) => {
    message += `*${index + 1}.* ${item.description}\n`;
    message += `   Valor: ${formatPrice(item.price)}\n\n`;
  });

  message += `-----------------------------------\n`;
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
  orderState.selectedFlavors = {};
  orderState.selectedToppings = [];
  orderState.selectedChocos = {};
  orderState.gelatoQty = 1;
  orderState.chocoQty = 1;
  document.getElementById('gelatoQty').value = 1;
  document.getElementById('chocoQty').value = 1;
  updateFlavorSelection();
  updateChocoSelection();
  document.querySelectorAll('#toppingsGrid .topping-item').forEach(i => i.classList.remove('selected'));
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
