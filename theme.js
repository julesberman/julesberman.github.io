document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeLink = document.getElementById('theme-style');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (!toggleBtn || !themeLink) return;

  // Check for saved user preference, if any
  const savedTheme = localStorage.getItem('theme');
  let currentTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
  
  // Apply the theme
  applyTheme(currentTheme);

  // Toggle theme on button click
  toggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    // Save the preference
    localStorage.setItem('theme', currentTheme);
  });

  function applyTheme(theme) {
    themeLink.setAttribute('href', `/${theme}.css`);
    toggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Listen for system theme changes
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!savedTheme) { // Only change if user hasn't set a preference
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
    }
  });
});
