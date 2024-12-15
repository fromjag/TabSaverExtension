// Make setTheme global
window.setTheme = function(theme) {
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = systemTheme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

// Load initial theme
chrome.storage.local.get('theme', function(data) {
  const theme = data.theme || 'system';
  document.getElementById('themeSelector').value = theme;
  window.setTheme(theme);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  chrome.storage.local.get('theme', function(data) {
    if (data.theme === 'system') {
      window.setTheme('system');
    }
  });
});