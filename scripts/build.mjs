import { mkdir, writeFile, copyFile, cp, readdir, stat, rm } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { homepage, casepage, shell } from '../src/components.mjs';
import { projects, identity, copy } from '../src/content.mjs';

const root = resolve(import.meta.dirname, '..');
process.chdir(root);
const routes = [];
async function save(path, content) {
  const file = join(root, path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
  routes.push('/' + (path ? path + '/' : ''));
}
await mkdir('assets', { recursive: true });
await copyFile('src/site.css', 'assets/site.css');
await copyFile('src/app.js', 'assets/app.js');
await copyFile('src/theme.js', 'assets/theme.js');
for (const lang of ['en', 'fa']) {
  await save(lang === 'en' ? '' : 'fa', homepage(lang));
  for (const project of projects) await save(`${lang === 'fa' ? 'fa/' : ''}work/${project.slug}`, casepage(project, lang));
}
await writeFile('404.html', shell('en', `<section class="not-found wrap"><p class="mono">404 / FIELD NOTE NOT FOUND</p><h1>${copy.en.notFound}</h1><a class="primary-link" href="/">${copy.en.home} ↗</a></section>`, { notFound: true }));
await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${identity.origin}${route}</loc></url>`).join('')}</urlset>\n`);
await writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${identity.origin}/sitemap.xml\n`);
await writeFile('.nojekyll', '');
// dist is generated output only. Original project assets and documents are never deleted.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', '404.html', 'fa', 'work', 'assets', 'robots.txt', 'sitemap.xml', '.nojekyll', 'Erfan_Moghaddam_Android_Developer_CV_EN.pdf', 'Erfan_Moghaddam_Android_Developer_CV_FA.pdf']) {
  if (path === 'assets') {
    await mkdir('dist/assets', { recursive: true });
    for (const entry of await readdir('assets')) {
      await cp(join('assets', entry), join('dist/assets', entry), { recursive: true });
    }
  } else await cp(path, join('dist', path), { recursive: true });
}
let bytes = 0;
for (const file of ['assets/site.css', 'assets/app.js', 'assets/theme.js']) bytes += (await stat(file)).size;
console.log(`Built ${routes.length} pages + 404. CSS + JavaScript: ${(bytes / 1024).toFixed(1)} KiB. Static output: dist/`);
