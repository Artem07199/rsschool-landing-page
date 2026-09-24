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