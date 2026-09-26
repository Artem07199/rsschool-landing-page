const lightButton = document.querySelector('.theme-light');
const darkButton = document.querySelector('.theme-dark');

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
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

const burgerBtn = document.querySelector('.burger-btn');

function setMenuOpen(isOpen) {
  document.body.classList.toggle('menu-open', isOpen);

    if (isOpen) {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.dataset.scrollY = scrollY;
  } else {
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, Number(document.body.dataset.scrollY || 0));
  }

  if (burgerBtn) {
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    burgerBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    setMenuOpen(!document.body.classList.contains('menu-open'));
  });
}

document.querySelectorAll('.header-navigation a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    setMenuOpen(false);
  }
});





const sliderTrack = document.querySelector('.slider-track');
const sliderViewport = document.querySelector('.slider-viewport');
const sliderPrevBtn = document.querySelector('.slider-button-left');
const sliderNextBtn = document.querySelector('.slider-button-right');
const sliderPaginationItems = document.querySelectorAll('.pagination-item');

let sliderPosition = 1;
let realSlidesCount = 0;
let isSliderAnimating = false;

function setSliderPosition(position, animate = true) {
  sliderPosition = position;
  sliderTrack.style.transition = animate ? 'transform 0.4s ease' : 'none';

  const offset = sliderViewport.clientWidth * sliderPosition;
  sliderTrack.style.transform = `translateX(-${offset}px)`;

  const realIndex = (sliderPosition - 1 + realSlidesCount) % realSlidesCount;
  sliderPaginationItems.forEach((item, i) => {
    item.classList.toggle('active', i === realIndex);
  });
}

function goToSlide(direction) {
  if (!sliderTrack || isSliderAnimating) return;
  isSliderAnimating = true;
  setSliderPosition(sliderPosition + direction, true);
}

if (sliderTrack && sliderViewport) {
  const originalCards = Array.from(sliderTrack.children);
  realSlidesCount = originalCards.length;

  const firstClone = originalCards[0].cloneNode(true);
  const lastClone = originalCards[originalCards.length - 1].cloneNode(true);

  sliderTrack.appendChild(firstClone);
  sliderTrack.insertBefore(lastClone, originalCards[0]);

  setSliderPosition(1, false);

  sliderTrack.addEventListener('transitionend', (e) => {
    if (e.target !== sliderTrack || e.propertyName !== 'transform') return;

    if (sliderPosition === 0) {
      setSliderPosition(realSlidesCount, false);
    } else if (sliderPosition === realSlidesCount + 1) {
      setSliderPosition(1, false);
    }

    isSliderAnimating = false;
  });
}

if (sliderPrevBtn) {
  sliderPrevBtn.addEventListener('click', () => goToSlide(-1));
}

if (sliderNextBtn) {
  sliderNextBtn.addEventListener('click', () => goToSlide(1));
}

sliderPaginationItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    if (isSliderAnimating || i + 1 === sliderPosition) return;
    isSliderAnimating = true;
    setSliderPosition(i + 1, true);
  });
});

if (sliderViewport) {
  let touchStartX = 0;
  let touchEndX = 0;

  sliderViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderViewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    const swipeThreshold = 40;

    if (delta > swipeThreshold) {
      goToSlide(-1);
    } else if (delta < -swipeThreshold) {
      goToSlide(1);
    }
  }, { passive: true });
}

window.addEventListener('resize', () => {
  setSliderPosition(sliderPosition, false);
});



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
    const hasMoreThanFour = currentProducts.length > 4;
    menuLoadMoreBtn.style.display = hasMoreThanFour ? '' : 'none';
  }
}

fetch('products.json')
  .then((response) => response.json())
  .then((products) => {
    allProducts = products;
    renderMenuCards(activeCategory);
  })
  .catch((error) => {
    console.error('Failed to load products.json:', error);
  });

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

if (menuCardsContainer) {
  menuCardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-card');
    if (!card) return;

    const index = Number(card.dataset.index);
    openProductModal(currentProducts[index]);
  });
}

const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalSizes = document.getElementById('modalSizes');
const modalAdditives = document.getElementById('modalAdditives');
const modalTotal = document.getElementById('modalTotal');
const modalCloseBtn = document.querySelector('.modal-close');
const modalCloseBtnBottom = document.querySelector('.modal-close-btn');

let modalBasePrice = 0;
let modalSizeAddPrice = 0;
let modalAdditivesAddPrice = 0;

function updateModalTotal() {
  const total = modalBasePrice + modalSizeAddPrice + modalAdditivesAddPrice;
  modalTotal.textContent = `$${total.toFixed(2)}`;
}

function openProductModal(product) {
  if (!product || !modalOverlay) return;

  modalImage.src = product.image || '';
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;

  modalBasePrice = parseFloat(product.price);
  modalSizeAddPrice = 0;
  modalAdditivesAddPrice = 0;

  const sizeEntries = Object.entries(product.sizes || {});
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

function openModal() {
  const scrollY = window.scrollY;
  document.body.dataset.modalScrollY = scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';

  modalOverlay.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');

  const scrollY = Number(document.body.dataset.modalScrollY || 0);
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY);
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

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalCloseBtnBottom) modalCloseBtnBottom.addEventListener('click', closeModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
    closeModal();
  }
});