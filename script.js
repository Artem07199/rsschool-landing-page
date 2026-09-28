/* ===== Theme ===== */
const lightButton = document.querySelector('.theme-light');
const darkButton = document.querySelector('.theme-dark');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-theme');
}

if (lightButton) {
  lightButton.addEventListener('click', () => {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  });
}

if (darkButton) {
  darkButton.addEventListener('click', () => {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  });
}

/* ===== Блокировка скролла (общая для меню и модалки) ===== */
let lockedScrollY = 0;
let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ > 0) return;
  lockedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = '100%';
}

function unlockScroll() {
  if (scrollLocks === 0 || --scrollLocks > 0) return;

  const html = document.documentElement;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';

  // отключаем smooth, чтобы позиция вернулась мгновенно
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, lockedScrollY);
  html.style.scrollBehavior = '';
}

/* ===== Бургер-меню ===== */
const burgerBtn = document.querySelector('.burger-btn');
let menuIsOpen = false;
let menuCloseTimer = null;

function setMenuOpen(isOpen, animate = true) {
  if (isOpen === menuIsOpen) return;
  menuIsOpen = isOpen;
  clearTimeout(menuCloseTimer);

  const body = document.body;

  if (isOpen) {
    if (!body.classList.contains('menu-open')) lockScroll();
    body.classList.remove('menu-closing');
    body.classList.add('menu-open');
  } else {
    const finish = () => {
      body.classList.remove('menu-open', 'menu-closing');
      unlockScroll();
    };

    if (animate) {
      body.classList.add('menu-closing');
      menuCloseTimer = setTimeout(finish, 300);
    } else {
      finish();
    }
  }

  if (burgerBtn) {
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    burgerBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => setMenuOpen(!menuIsOpen));
}

document.querySelectorAll('.header-navigation a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false, false));
});

/* ===== Слайдер (только на главной) ===== */
const sliderTrack = document.querySelector('.slider-track');
const sliderViewport = document.querySelector('.slider-viewport');
const sliderPrevBtn = document.querySelector('.slider-button-left');
const sliderNextBtn = document.querySelector('.slider-button-right');
const sliderPaginationItems = document.querySelectorAll('.pagination-item');

if (sliderTrack && sliderViewport) {
  const originalCards = Array.from(sliderTrack.children);
  const realSlidesCount = originalCards.length;

  let sliderPosition = 1;
  let isSliderAnimating = false;
  let sliderFallbackTimer = null;

  sliderTrack.appendChild(originalCards[0].cloneNode(true));
  sliderTrack.insertBefore(
    originalCards[realSlidesCount - 1].cloneNode(true),
    originalCards[0]
  );

  function setSliderPosition(position, animate = true) {
    sliderPosition = position;
    sliderTrack.style.transition = animate ? 'transform 0.4s ease' : 'none';
    sliderTrack.style.transform = `translateX(-${sliderViewport.clientWidth * sliderPosition}px)`;

    const realIndex = (sliderPosition - 1 + realSlidesCount) % realSlidesCount;
    sliderPaginationItems.forEach((item, i) => {
      item.classList.toggle('active', i === realIndex);
    });
  }

  function finishSliderTransition() {
    clearTimeout(sliderFallbackTimer);

    if (sliderPosition === 0) {
      setSliderPosition(realSlidesCount, false);
    } else if (sliderPosition === realSlidesCount + 1) {
      setSliderPosition(1, false);
    }

    isSliderAnimating = false;
  }

  function moveSliderTo(position) {
    if (isSliderAnimating || position === sliderPosition) return;

    isSliderAnimating = true;
    setSliderPosition(position, true);

    // страховка: если transitionend не придёт, слайдер не «залипнет»
    clearTimeout(sliderFallbackTimer);
    sliderFallbackTimer = setTimeout(finishSliderTransition, 500);
  }

  setSliderPosition(1, false);

  sliderTrack.addEventListener('transitionend', (e) => {
    if (e.target !== sliderTrack || e.propertyName !== 'transform') return;
    finishSliderTransition();
  });

  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => moveSliderTo(sliderPosition - 1));
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => moveSliderTo(sliderPosition + 1));
  }

  sliderPaginationItems.forEach((item, i) => {
    item.addEventListener('click', () => moveSliderTo(i + 1));
  });

  let touchStartX = 0;
  let touchStartY = 0;

  sliderViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  sliderViewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    // игнорируем вертикальный скролл страницы
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    moveSliderTo(dx > 0 ? sliderPosition - 1 : sliderPosition + 1);
  }, { passive: true });

  window.addEventListener('resize', () => {
    clearTimeout(sliderFallbackTimer);
    isSliderAnimating = false;

    if (sliderPosition === 0) sliderPosition = realSlidesCount;
    else if (sliderPosition === realSlidesCount + 1) sliderPosition = 1;

    setSliderPosition(sliderPosition, false);
  });
}

/* ===== Страница меню: карточки ===== */
const menuCardsContainer = document.getElementById('menuCards');
const menuTabs = document.querySelectorAll('.menu-tab');
const menuLoadMoreBtn = document.querySelector('.menu-load-more');

let allProducts = [];
let currentProducts = [];
let activeCategory = 'coffee';

function renderMenuCards(category) {
  if (!menuCardsContainer) return;

  currentProducts = allProducts.filter((product) => product.category === category);
  const categoryCounters = {};

  menuCardsContainer.innerHTML = currentProducts.map((product, index) => {
    categoryCounters[product.category] = (categoryCounters[product.category] || 0) + 1;
    const imageNumber = categoryCounters[product.category];
    const imagePath = `assets/img/${product.category}-${imageNumber}.jpg`;
    product.image = imagePath;

    return `
      <div class="menu-card" data-index="${index}">
        <img src="${imagePath}" alt="${product.name}">

        <div class="menu-card-content">
          <h2 class="menu-card-heading">${product.name}</h2>
          <p class="menu-card-subheading">${product.description}</p>
          <strong class="menu-card-price">$${product.price}</strong>
        </div>
      </div>
    `;
  }).join('');

  menuCardsContainer.classList.remove('expanded');

  if (menuLoadMoreBtn) {
    menuLoadMoreBtn.style.display = currentProducts.length > 4 ? '' : 'none';
  }
}

if (menuCardsContainer) {
  fetch('products.json')
    .then((response) => response.json())
    .then((products) => {
      allProducts = products;
      renderMenuCards(activeCategory);
    })
    .catch((error) => {
      console.error('Failed to load products.json:', error);
    });

  menuCardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-card');
    if (!card) return;
    openProductModal(currentProducts[Number(card.dataset.index)]);
  });
}

menuTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    menuTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    activeCategory = tab.dataset.category;
    renderMenuCards(activeCategory);
  });
});

if (menuLoadMoreBtn && menuCardsContainer) {
  menuLoadMoreBtn.addEventListener('click', () => {
    menuCardsContainer.classList.add('expanded');
    menuLoadMoreBtn.style.display = 'none';
  });
}

/* ===== Модальное окно ===== */
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalSizes = document.getElementById('modalSizes');
const modalAdditives = document.getElementById('modalAdditives');
const modalTotal = document.getElementById('modalTotal');
const modalCloseBtnBottom = document.querySelector('.modal-close-btn');

let modalBasePrice = 0;
let modalSizeAddPrice = 0;
let modalAdditivesAddPrice = 0;

function updateModalTotal() {
  const total = modalBasePrice + modalSizeAddPrice + modalAdditivesAddPrice;
  modalTotal.textContent = `$${total.toFixed(2)}`;
}

function openModal() {
  lockScroll();
  modalOverlay.classList.add('open');
}

function closeModal() {
  if (!modalOverlay || !modalOverlay.classList.contains('open')) return;
  modalOverlay.classList.remove('open');
  unlockScroll();
}

function openProductModal(product) {
  if (!product || !modalOverlay) return;

  modalImage.src = product.image || '';
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;

  const sizeEntries = Object.entries(product.sizes || {});

  modalBasePrice = parseFloat(product.price);
  modalSizeAddPrice = sizeEntries.length ? parseFloat(sizeEntries[0][1]['add-price']) : 0;
  modalAdditivesAddPrice = 0;

  modalSizes.innerHTML = sizeEntries.map(([key, size], i) => `
    <button type="button" class="modal-size-btn${i === 0 ? ' active' : ''}" data-add-price="${size['add-price']}">
      <span class="badge">${key.toUpperCase()}</span>
      <span>${size.size}</span>
    </button>
  `).join('');

  modalAdditives.innerHTML = (product.additives || []).map((additive, i) => `
    <button type="button" class="modal-additive-btn" data-add-price="${additive['add-price']}">
      <span class="badge">${i + 1}</span>
      <span>${additive.name}</span>
    </button>
  `).join('');

  updateModalTotal();
  openModal();
}

if (modalSizes) {
  modalSizes.addEventListener('click', (e) => {
    const btn = e.target.closest('.modal-size-btn');
    if (!btn) return;

    modalSizes.querySelectorAll('.modal-size-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    modalSizeAddPrice = parseFloat(btn.dataset.addPrice);
    updateModalTotal();
  });
}

if (modalAdditives) {
  modalAdditives.addEventListener('click', (e) => {
    const btn = e.target.closest('.modal-additive-btn');
    if (!btn) return;

    btn.classList.toggle('active');
    modalAdditivesAddPrice = Array.from(modalAdditives.querySelectorAll('.modal-additive-btn.active'))
      .reduce((sum, b) => sum + parseFloat(b.dataset.addPrice), 0);
    updateModalTotal();
  });
}

if (modalCloseBtnBottom) modalCloseBtnBottom.addEventListener('click', closeModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

/* ===== Escape: сначала модалка, иначе бургер-меню ===== */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  if (modalOverlay && modalOverlay.classList.contains('open')) {
    closeModal();
  } else if (menuIsOpen) {
    setMenuOpen(false);
  }
});

/* ===== Переход через брейкпоинт 768px ===== */
const mobileMedia = window.matchMedia('(max-width: 768px)');

mobileMedia.addEventListener('change', (e) => {
  if (!e.matches) setMenuOpen(false, false);

  // начальный набор карточек и кнопка пересчитываются под новую ширину
  if (menuCardsContainer && allProducts.length) {
    renderMenuCards(activeCategory);
  }
});