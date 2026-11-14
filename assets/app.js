// Progressive enhancement only. Project content and navigation are static HTML.
const root = document.documentElement;
const isPersian = root.lang === 'fa';

/** @param {string} key @param {string} value */
function remember(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Preference persistence is optional. */ }
}

const themeButton = document.querySelector('[data-theme-toggle]');
if (themeButton instanceof HTMLButtonElement) {
  const updateThemeLabel = () => {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', isPersian ? `تغییر به حالت ${dark ? 'روشن' : 'تیره'}` : `Switch to ${dark ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#20231f' : '#f2efe8');
  };
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    remember('portfolio_theme', root.dataset.theme);
    updateThemeLabel();
  });
}

document.querySelector('[data-language-switch]')?.addEventListener('click', () => {
  remember('portfolio_lang', isPersian ? 'en' : 'fa');
});

// Native dialog provides focus containment, Escape and inert background content.
const menu = document.querySelector('#mobile-menu');
const menuButton = document.querySelector('[data-open-menu]');
if (menu instanceof HTMLDialogElement && menuButton instanceof HTMLButtonElement) {
  menuButton.addEventListener('click', () => {
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-is-open');
  });
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-is-open');
    menuButton.focus({ preventScroll: true });
  });
  menu.addEventListener('click', (event) => {
    if (event.target !== menu) return;
    const box = menu.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) menu.close();
  });
  // Keep Tab within the dialog rather than cycling through browser chrome.
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const stops = [...menu.querySelectorAll('button, a[href]')].filter((node) => node instanceof HTMLElement);
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => menu.close()));
  window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => { if (event.matches && menu.open) menu.close(); });
}

const parking = document.querySelector('[data-parking]');
if (parking instanceof HTMLElement) {
  const initial = [true, false, true, true, false, false];
  let states = [...initial];
  const buttons = [...parking.querySelectorAll('button[data-bay]')].filter((node) => node instanceof HTMLButtonElement);
  /** @param {number | null} last */
  const render = (last) => {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(states[i]));
      button.setAttribute('aria-label', `${parking.dataset.bayLabel} ${i + 1}: ${states[i] ? parking.dataset.occupied : parking.dataset.free}`);
      button.dataset.last = String(i === last);
    });
    const counter = parking.querySelector('[data-space-count]');
    if (counter) counter.textContent = String(states.filter((occupied) => !occupied).length).padStart(2, '0');
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => { states[i] = !states[i]; render(i); }));
  parking.querySelector('[data-reset]')?.addEventListener('click', () => { states = [...initial]; render(1); });
}

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const controls = gallery.querySelectorAll('button[data-gallery-select]');
  controls.forEach((control) => {
    if (!(control instanceof HTMLButtonElement)) return;
    control.addEventListener('click', () => {
      const index = control.dataset.gallerySelect;
      controls.forEach((other) => other.setAttribute('aria-pressed', String(other === control)));
      gallery.querySelectorAll('[data-gallery-image]').forEach((image) => {
        if (image instanceof HTMLImageElement) image.hidden = image.dataset.galleryImage !== index;
      });
      const caption = gallery.querySelector('[data-gallery-caption]');
      if (caption) caption.textContent = control.dataset.caption || '';
    });
  });
});

const tv = document.querySelector('[data-tv]');
if (tv instanceof HTMLElement) {
  /** @type {string[]} */
  const messages = JSON.parse(tv.dataset.messages || '[]');
  /** @type {string[]} */
  const help = JSON.parse(tv.dataset.help || '[]');
  tv.querySelectorAll('button[data-tv-select]').forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', () => {
      const index = Number(button.dataset.tvSelect);
      tv.querySelectorAll('[data-tv-select]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      const title = tv.querySelector('[data-tv-message]');
      const description = tv.querySelector('[data-tv-help]');
      const icon = tv.querySelector('[data-tv-icon]');
      if (title) title.textContent = messages[index];
      if (description) description.textContent = help[index];
      if (icon) icon.textContent = index ? '!' : '◷';
    });
  });
}

const copyButton = document.querySelector('[data-copy-email]');
if (copyButton instanceof HTMLButtonElement) {
  const initialCopyIcon = copyButton.innerHTML;
  copyButton.addEventListener('click', async () => {
    const email = document.querySelector('.email-row a')?.textContent?.trim();
    const announcements = document.querySelector('#announcements');
    if (!email || !announcements) return;
    try {
      await navigator.clipboard.writeText(email);
      announcements.textContent = copyButton.dataset.success || '';
      copyButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
    } catch {
      announcements.textContent = copyButton.dataset.error || '';
      copyButton.innerHTML = initialCopyIcon;
    }
  });
}

// Read viewport position once per frame, keeping the active section unambiguous
// even in the long project showcase. No scroll interception or scroll animation.
const navLinks = [...document.querySelectorAll('.nav-links a[data-section]')];
const sections = ['work', 'capabilities', 'about', 'contact'].map((id) => document.getElementById(id)).filter((section) => section !== null);
if (sections.length) {
  let scheduled = false;
  const updateNav = () => {
    const atEnd = window.scrollY + window.innerHeight >= root.scrollHeight - 15;
    const current = atEnd ? 'contact' : [...sections].reverse().find((section) => section.getBoundingClientRect().top <= window.innerHeight * .4)?.id;
    navLinks.forEach((link) => {
      if (link instanceof HTMLElement && link.dataset.section === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  window.addEventListener('resize', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); } });
  updateNav();
}
