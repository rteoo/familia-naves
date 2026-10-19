/* Teô v2.7.1 theme contract, localized for Família Naves. Runs before paint. */
(() => {
  const root = document.documentElement;
  const key = 'teo-personal-theme';
  let theme = 'dark';
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (_) { /* Dark remains usable when storage is unavailable. */ }
  root.dataset.theme = theme;

  function sync() {
    const light = root.dataset.theme === 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.textContent = light ? 'Tema escuro' : 'Tema claro';
      button.setAttribute('aria-label', `Ativar tema ${light ? 'escuro' : 'claro'}`);
      button.setAttribute('aria-pressed', String(light));
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        try { localStorage.setItem(key, root.dataset.theme); } catch (_) { /* Optional persistence. */ }
        sync();
      });
    });
  });
})();
