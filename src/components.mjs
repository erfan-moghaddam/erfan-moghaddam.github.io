import { copy, identity, projects } from './content.mjs';
import { existsSync } from 'node:fs';

export const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
export const down = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg>';
export const external = (href, label, className = 'text-link') => `<a class="${className}" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)}${arrow}</a>`;
export const projectPath = (lang, slug) => `${lang === 'fa' ? '/fa' : ''}/work/${slug}/`;
export const homePath = (lang) => lang === 'fa' ? '/fa/' : '/';

export function header(lang, slug = '') {
  const t = copy[lang];
  const home = homePath(lang);
  const other = lang === 'fa' ? 'en' : 'fa';
  const otherPath = slug ? projectPath(other, slug) : homePath(other);
  const nav = ['work', 'capabilities', 'about', 'contact'].map((id, i) => `<a href="${home}#${id}" data-section="${id}"><span class="nav-index" aria-hidden="true">0${i + 1}</span>${escape(t.nav[i])}</a>`).join('');
  return `<a class="skip-link" href="#main-content">${t.skip}</a>
  <header class="site-header"><div class="header-inner wrap">
    <a class="brand" href="${home}" aria-label="${escape(t.name)} — ${lang === 'fa' ? 'خانه' : 'Home'}"><span class="monogram" aria-hidden="true">e<span>m</span><i></i></span><span class="brand-name">${t.name}<small>${lang === 'fa' ? 'توسعه‌دهنده اندروید' : 'Android Engineer'}</small></span></a>
    <nav class="nav-links" aria-label="${lang === 'fa' ? 'ناوبری اصلی' : 'Primary navigation'}">${nav}</nav>
    <div class="header-tools"><a class="language-switch" href="${otherPath}" lang="${other}" hreflang="${other}" data-language-switch>${t.language}</a><button class="theme-toggle js-control" type="button" data-theme-toggle aria-label="${t.theme}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 5a7 7 0 0 0 0 14Z" fill="currentColor"/></svg></button><button class="menu-toggle js-control" type="button" data-open-menu aria-controls="mobile-menu" aria-expanded="false">${t.menu}<span aria-hidden="true">＋</span></button></div>
  </div></header>
  <dialog class="mobile-menu" id="mobile-menu" aria-label="${t.menu}"><div class="menu-heading"><span class="mono">${t.name}</span><form method="dialog"><button class="icon-button" aria-label="${t.close}">×</button></form></div><nav aria-label="${lang === 'fa' ? 'ناوبری موبایل' : 'Mobile navigation'}">${nav}</nav><div class="menu-foot"><span class="availability-dot"></span>${t.available}</div></dialog>`;
}

export function footer(lang) {
  const t = copy[lang];
  return `<footer class="site-footer wrap"><a class="footer-brand" href="${homePath(lang)}">${t.name}<span class="mono">© 2026</span></a><p>${t.footer}</p><a class="back-top" href="#top">${t.top}${down}</a></footer>`;
}

const car = `<svg class="car" viewBox="0 0 60 112" aria-hidden="true"><rect x="8" y="4" width="44" height="104" rx="15" fill="currentColor"/><path d="M14 30q16-8 32 0l-3 16H17Z" fill="var(--car-glass)"/><path d="m17 72-3 15q16 7 32 0l-3-15Z" fill="var(--car-glass)"/><path d="M12 47v24m36-24v24M18 9h24M18 102h24" stroke="var(--car-line)" stroke-width="2"/><path d="M4 35h5m42 0h5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;

export function parking(lang) {
  const t = copy[lang];
  const occupied = [true, false, true, true, false, false];
  const bays = occupied.map((state, i) => `<button type="button" class="bay js-control" data-bay="${i}" aria-pressed="${state}" aria-label="${t.bay} ${i + 1}: ${state ? t.occupied : t.free}"${i === 1 ? ' data-last="true"' : ''}><span class="bay-number" aria-hidden="true">0${i + 1}</span>${car}<span class="bay-plus" aria-hidden="true">＋</span></button>`).join('');
  return `<figure class="system-study" data-parking data-free="${t.free}" data-occupied="${t.occupied}" data-bay-label="${t.bay}" aria-labelledby="study-title">
    <div class="study-top mono"><span id="study-title">${t.study}</span><span class="study-cross" aria-hidden="true">＋</span></div>
    <div class="plan-scene" dir="ltr"><span class="plan-word" aria-hidden="true">P<span>01—06</span></span><div class="dimension dimension-top" aria-hidden="true">6 SPACES / 1 CONNECTED SYSTEM</div><div class="parking-plan"><div class="bays">${bays}</div><div class="plan-lane" aria-hidden="true"><span>→</span><span>ENTRY / EXIT</span><span>→</span></div></div><div class="plan-route" aria-hidden="true"><svg viewBox="0 0 180 100"><path d="M175 8H94v70H8"/><circle cx="175" cy="8" r="3"/><circle cx="8" cy="78" r="3"/></svg></div><div class="mini-device"><span class="device-signal" aria-hidden="true">▂▄▆</span><output class="space-count" aria-live="polite" aria-atomic="true"><span data-space-count>03</span><small>/ 06</small><span class="sr-only">${t.availableSpaces}</span></output><span class="device-label">${t.availableSpaces}</span><span class="device-line" aria-hidden="true"></span></div><div class="plan-marker" aria-hidden="true">↗</div></div>
    <div class="study-flow mono">${t.flow.map((item, i) => `<span>${item}</span>${i < 2 ? '<span class="flow-line" aria-hidden="true">→</span>' : ''}`).join('')}</div>
    <figcaption class="study-caption"><span>${t.concept}</span><div><span class="interaction-hint">${t.bayHint}</span><button class="reset-button js-control" type="button" data-reset>${t.reset}<span aria-hidden="true">↺</span></button></div></figcaption>
  </figure>`;
}

export function phoneGallery(lang, operator = false) {
  const t = copy[lang];
  const shots = operator ? ['parkit_home', 'parkit_search', 'parkit_payment'] : ['public_wallet', 'public_biometric', 'public_splash'];
  const labels = operator ? (lang === 'fa' ? ['خانه', 'جستجو', 'پرداخت'] : ['Home', 'Search', 'Payment']) : t.galleryLabels;
  const sizes = operator ? [[612, 1252], [612, 1252], [612, 1252]] : [[592, 1280], [627, 1252], [612, 1316]];
  return `<figure class="phone-gallery" data-gallery><span class="stage-index mono" aria-hidden="true">${operator ? '04' : '01'} / ANDROID</span><span class="stage-word" aria-hidden="true">${operator ? 'Work.' : 'Move.'}</span><div class="phone-secondary" aria-hidden="true"><img src="/assets/images/${operator ? 'parkit_otp' : 'public_splash'}.webp" width="612" height="${operator ? '1252' : '1316'}" alt="" loading="lazy" decoding="async"></div><div class="phone-primary">${shots.map((shot, i) => `<img data-gallery-image="${i}" src="/assets/images/${shot}.webp" width="${sizes[i][0]}" height="${sizes[i][1]}" alt="${escape(`${operator ? 'Parking Operations' : 'MyNexPark'} — ${labels[i]}`)}" loading="lazy" decoding="async"${i ? ' hidden' : ''}>`).join('')}</div><figcaption><span class="gallery-caption" data-gallery-caption>${t.screenshot} · ${labels[0]}</span><div class="gallery-controls js-control" role="group" aria-label="${t.gallery}">${labels.map((label, i) => `<button type="button" data-gallery-select="${i}" data-caption="${t.screenshot} · ${label}" aria-pressed="${!i}"><span class="mono" aria-hidden="true">0${i + 1}</span><span>${label}</span></button>`).join('')}</div><noscript>${shots.slice(1).map((shot, i) => `<a href="/assets/images/${shot}.webp">${labels[i + 1]}</a>`).join(' · ')}</noscript></figcaption></figure>`;
}

export function tv(lang) {
  const t = copy[lang];
  return `<figure class="tv-study" data-tv data-messages="${escape(JSON.stringify(t.tvMessages))}" data-help="${escape(JSON.stringify(t.tvHelp))}"><div class="tv-ambient" aria-hidden="true">N</div><div class="tv-device"><div class="tv-inner"><div class="tv-wordmark" dir="ltr"><span aria-hidden="true">↗</span>NEXPark</div><div class="tv-status-icon" aria-hidden="true" data-tv-icon>◷</div><div class="tv-copy" aria-live="polite" aria-atomic="true"><strong data-tv-message>${t.tvMessages[0]}</strong><p data-tv-help>${t.tvHelp[0]}</p></div><div class="tv-caption-line mono">NEXPARK / DISPLAY SYSTEM</div></div></div><div class="tv-base" aria-hidden="true"></div><figcaption><div class="tv-controls js-control" role="group" aria-label="${t.tvStudy}">${t.tvStates.map((text, i) => `<button type="button" aria-pressed="${!i}" data-tv-select="${i}">${text}</button>`).join('')}</div><span>${t.tvStudy}</span></figcaption></figure>`;
}

export function dashboard(lang) {
  const t = copy[lang];
  const fresh = existsSync(new URL('../assets/images/dashboard-login.webp', import.meta.url));
  return `<figure class="dashboard-stage"><div class="desktop-device"><div class="desktop-screen"><img src="/assets/images/${fresh ? 'dashboard-login' : 'nexpark-admin-login'}.webp" width="${fresh ? '1440' : '709'}" height="${fresh ? '900' : '1536'}" alt="${lang === 'fa' ? 'رابط ورود واقعی پنل نکس‌پارک؛ هیچ حسابی وارد نشده است' : 'Actual NexPark admin sign-in interface; no account is signed in'}" loading="lazy" decoding="async" class="${fresh ? '' : 'portrait-capture'}"></div><div class="desktop-chin" aria-hidden="true"></div></div><div class="desktop-stand" aria-hidden="true"></div><figcaption>${fresh ? t.dashboardCapture : t.dashboardFallback}</figcaption><div class="dashboard-foot mono"><span>NEXT.JS / REACT</span><span>03 / WEB</span></div></figure>`;
}

export function projectMedia(project, lang) {
  return project.kind === 'tv' ? tv(lang) : project.kind === 'web' ? dashboard(lang) : phoneGallery(lang, project.kind === 'operator');
}

export function projectFeature(project, lang) {
  const p = project[lang], t = copy[lang];
  return `<article class="project-feature project-${project.kind}" id="${project.anchor}"><div class="project-copy"><div class="project-eyebrow mono"><span>${project.number} / ${p.category}</span><span class="project-mark" aria-hidden="true">↗</span></div><h3>${escape(p.title).replace('\n', '<br>')}</h3><p class="project-summary">${p.summary}</p><div class="project-name">${project.name}<span>${p.status}</span></div><ul class="tech-list" aria-label="${t.projectLabels[4]}">${project.tech.map((tech) => `<li>${tech}</li>`).join('')}</ul><a class="case-link" href="${projectPath(lang, project.slug)}">${t.case}<span class="circle-arrow">${arrow}</span></a>${project.kind === 'mobile' ? external(identity.bazaar, t.viewApp, 'store-link') : ''}</div>${projectMedia(project, lang)}</article>`;
}

export function contact(lang) {
  const t = copy[lang];
  return `<section class="contact-section" id="contact"><div class="wrap"><div class="section-label mono">${t.contactLabel}</div><div class="contact-grid"><div><h2>${t.contact1}<br><em>${t.contact2}</em></h2><p class="contact-intro">${t.contactText}</p><a class="contact-cta" href="mailto:${identity.email}">${t.email}<span>${arrow}</span></a></div><div class="contact-details"><span class="availability"><span class="availability-dot"></span>${t.available}</span><div class="email-row"><a href="mailto:${identity.email}" dir="ltr">${identity.email}</a><button type="button" class="copy-button js-control" data-copy-email aria-label="${t.copyEmail}" data-success="${t.copied}" data-error="${t.copyFail}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M15 4H4v11"/></svg></button></div><p class="copy-feedback" id="announcements" role="status"></p><div class="social-links">${external(identity.linkedin, 'LinkedIn')}${external(identity.github, 'GitHub')}</div><a class="phone-link" href="tel:${identity.phone}"><span>${t.phone}</span><span dir="ltr">+98 930 066 1383</span></a><div class="location mono">${t.location}</div></div></div></div></section>`;
}

export function shell(lang, body, options = {}) {
  const t = copy[lang];
  const slug = options.slug || '';
  const path = options.notFound ? '/404.html' : slug ? projectPath(lang, slug) : homePath(lang);
  const en = slug ? projectPath('en', slug) : '/';
  const fa = slug ? projectPath('fa', slug) : '/fa/';
  const title = options.title ? `${options.title} — ${t.name}` : t.title;
  const desc = options.description || t.description;
  const schema = slug ? { '@context': 'https://schema.org', '@type': 'CreativeWork', name: options.title, description: desc, url: identity.origin + path, author: { '@type': 'Person', name: identity.name, url: identity.origin } } : { '@context': 'https://schema.org', '@type': 'Person', name: identity.name, jobTitle: 'Android Engineer / Software Developer', url: identity.origin, image: identity.origin + '/assets/images/profile.webp', sameAs: [identity.github, identity.linkedin], knowsAbout: ['Kotlin', 'Jetpack Compose', 'Android development', 'Android TV', 'Next.js', 'React', 'API integration'] };
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'fa' ? 'rtl' : 'ltr'}" data-theme="light" class="no-js"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(desc)}"><meta name="author" content="Erfan Moghaddam"><meta name="theme-color" content="#f2efe8"><meta name="color-scheme" content="light dark"><meta name="robots" content="${options.notFound ? 'noindex, follow' : 'index, follow'}">
<link rel="canonical" href="${identity.origin}${path}"><link rel="alternate" hreflang="en" href="${identity.origin}${en}"><link rel="alternate" hreflang="fa" href="${identity.origin}${fa}"><link rel="alternate" hreflang="x-default" href="${identity.origin}${en}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:url" content="${identity.origin}${path}"><meta property="og:image" content="${identity.origin}/assets/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Erfan Moghaddam — Android Engineer. From pixels to the physical."><meta property="og:locale" content="${lang === 'fa' ? 'fa_IR' : 'en_US'}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(desc)}"><meta name="twitter:image" content="${identity.origin}/assets/social-preview.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/${lang === 'fa' ? 'vazirmatn' : 'manrope'}.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css"><script src="/assets/theme.js"></script><script type="module" src="/assets/app.js"></script><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>
<body id="top">${header(lang, slug)}<main id="main-content" tabindex="-1">${body}</main>${footer(lang)}<noscript><p class="noscript-note wrap">${t.noScript}</p></noscript></body></html>`;
}

export function homepage(lang) {
  const t = copy[lang];
  const body = `<section class="hero wrap" aria-labelledby="hero-title"><div class="hero-topline mono"><span>${t.issue}</span><span class="availability"><span class="availability-dot"></span>${t.available}</span></div><div class="hero-grid"><div class="hero-copy"><p class="hero-role"><span class="role-dash" aria-hidden="true"></span>${t.role}</p><h1 id="hero-title">${t.hero1}<br>${t.hero2}<br><em>${t.hero3}</em></h1><p class="hero-intro">${t.intro}</p><div class="hero-actions"><a class="primary-link" href="#work"><span class="button-circle">${down}</span>${t.explore}</a><a class="text-link" href="#contact">${t.talk}${arrow}</a></div></div>${parking(lang)}</div><div class="hero-foot mono"><span>KOTLIN · JETPACK COMPOSE · CONNECTED SYSTEMS</span><span class="hero-foot-note">${t.liveNote}</span></div></section>
  <section class="work-section wrap" id="work"><div class="section-label mono">${t.workLabel}</div><div class="section-heading"><h2>${t.work1}<br><em>${t.work2}</em></h2><p>${t.workIntro}</p></div>${projects.slice(0, 3).map((p) => projectFeature(p, lang)).join('')}
  <div class="more-work" id="public-work"><div class="section-label mono">${t.more}</div><a class="archive-row" href="${projectPath(lang, 'parking-operations')}"><span class="mono">04 / ANDROID</span><div><h3>${t.operator}</h3><p>${t.operatorText}</p></div>${arrow}</a><div class="public-heading mono">${t.public}</div><div class="public-repos"><a href="${identity.github}/crypto-signal-api" target="_blank" rel="noopener noreferrer"><span class="mono">PYTHON / API</span><h3>${t.crypto}${arrow}</h3><p>${t.cryptoText}</p><span class="repo-label">${t.viewRepo}</span></a><a href="${identity.github}/erfan-moghaddam.github.io" target="_blank" rel="noopener noreferrer"><span class="mono">HTML / CSS / JAVASCRIPT</span><h3>${t.source}${arrow}</h3><p>${t.sourceText}</p><span class="repo-label">${t.viewRepo}</span></a></div></div></section>
  <section class="expertise-section" id="capabilities"><div class="wrap"><div class="section-label mono">${t.expertiseLabel}</div><div class="section-heading"><h2>${t.expertise1}<br><em>${t.expertise2}</em></h2><p>${t.expertiseIntro}</p></div><div class="expertise-list">${t.skillTitles.map((title, i) => `<article class="expertise-row"><span class="expertise-number mono">0${i + 1}</span><h3>${title}</h3><div><p>${t.skillText[i]}</p><ul class="expertise-tech">${t.skillTech[i].map((tech) => `<li>${tech}</li>`).join('')}</ul></div></article>`).join('')}</div></div></section>
  <section class="about-section wrap" id="about"><div class="section-label mono">${t.aboutLabel}</div><div class="about-grid"><div class="portrait-column"><figure class="portrait"><img src="/assets/images/profile.webp" width="420" height="420" alt="${t.name}" loading="lazy" decoding="async"><figcaption class="mono">${t.name}<br>ANDROID ENGINEER</figcaption></figure><span class="portrait-note mono">${t.location}</span></div><div class="about-copy"><h2>${t.about1}<br><em>${t.about2}</em></h2><p>${t.aboutText}</p><p>${t.aboutText2}</p><a class="text-link resume-link" href="/Erfan_Moghaddam_Android_Developer_CV_${lang === 'fa' ? 'FA' : 'EN'}.pdf" download>${t.cv}${down}</a></div></div><div class="process" id="process"><h3 class="mono">${t.process}</h3><ol>${t.processTitles.map((title, i) => `<li><span class="mono">0${i + 1}</span><h4>${title}</h4><p>${t.processText[i]}</p></li>`).join('')}</ol></div></section>${contact(lang)}`;
  return shell(lang, body);
}

export function casepage(project, lang) {
  const p = project[lang], t = copy[lang];
  const texts = [p.overview, p.problem, p.solution, p.role, project.tech.join(' · '), p.architecture, p.features, p.challenge, p.outcome, p.evidence];
  const release = project.kind === 'mobile' ? `<div class="release-block">${external(identity.bazaar, t.viewApp, 'primary-link')}${external('https://static.nexpark.ir/mynexpark/app/latest/mynexpark.apk', t.directApk)}<h3>${t.otherPlatforms}</h3><div class="release-links">${external('https://apps.apple.com/us/app/nexpark/id6802317642', 'App Store')}${external('https://sibapp.com/applications/nexpark', 'SibApp')}${external('https://www.nexpark.ir/', t.productSite)}</div><p>${t.widerNote}</p></div>` : `<p>${t.private}</p>`;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const body = `<div class="case-page wrap"><a class="case-back text-link" href="${homePath(lang)}#work">${down}${t.back}</a><div class="case-title"><p class="section-label mono">${project.number} / ${t.projectNote}</p><h1>${project.name}</h1><p class="case-lead">${p.summary}</p><div class="case-meta"><span>${p.category}</span><span>${p.status}</span></div></div><div class="case-media">${projectMedia(project, lang)}</div><div class="case-body"><aside class="case-toc"><span class="mono">${t.projectNote}</span><nav aria-label="${t.projectNote}">${t.projectLabels.map((label, i) => `<a href="#note-${i}">${label}</a>`).join('')}</nav></aside><div class="case-notes">${texts.map((text, i) => `<section id="note-${i}"><div class="note-number mono">${String(i + 1).padStart(2, '0')}</div><div><h2>${t.projectLabels[i]}</h2>${Array.isArray(text) ? `<ul>${text.map((feature) => `<li>${feature}</li>`).join('')}</ul>` : `<p>${text}</p>`}${i === 9 ? release : ''}</div></section>`).join('')}</div></div><a class="next-project" href="${projectPath(lang, next.slug)}"><span class="mono">${t.nextProject}</span><span>${next.name}</span>${arrow}</a></div>${contact(lang)}`;
  return shell(lang, body, { slug: project.slug, title: project.name, description: p.summary });
}
