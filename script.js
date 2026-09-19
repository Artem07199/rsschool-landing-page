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