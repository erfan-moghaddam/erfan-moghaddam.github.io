// Apply the saved preference before the first paint. Storage is optional.
(() => {
  const root = document.documentElement;
  root.classList.replace('no-js', 'js');
  try {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
    const persian = localStorage.getItem('portfolio_lang') === 'fa';
    const path = window.location.pathname;
    if (persian && root.lang === 'en' && /^\/(?:work\/(?:mynexpark|nexpark-display|nexpark-dashboard|parking-operations)\/?)?$/.test(path)) {
      window.location.replace('/fa' + path + window.location.search + window.location.hash);
    }
  } catch { /* Private browsing can make storage unavailable. */ }
})();
