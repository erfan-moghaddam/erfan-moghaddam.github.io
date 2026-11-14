import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';
import { projects, copy } from '../src/content.mjs';

const root = resolve(import.meta.dirname, '..', 'dist');
async function pages(dir = root) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await pages(path));
    else if (entry.name.endsWith('.html')) output.push(path);
  }
  return output;
}

test('Every route is pre-rendered with the correct language, SEO and semantic main heading', async () => {
  const all = await pages();
  assert.equal(all.length, 11);
  const canonicals = new Set();
  for (const path of all) {
    const html = await readFile(path, 'utf8');
    const fa = path.includes('/fa/');
    assert.match(html, new RegExp(`<html lang="${fa ? 'fa' : 'en'}" dir="${fa ? 'rtl' : 'ltr'}"`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, path);
    assert.match(html, /<main id="main-content"/);
    assert.match(html, /property="og:image" content="https:\/\/erfan-moghaddam.github.io\/assets\/social-preview.png"/);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.ok(!canonicals.has(canonical), canonical); canonicals.add(canonical);
    assert.ok(JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@type']);
  }
});

test('All internal paths, downloads, media and fragment targets resolve', async () => {
  for (const path of await pages()) {
    const html = await readFile(path, 'utf8');
    const attrs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const attr of attrs) {
      if (/^(?:https?:|mailto:|tel:|data:)/.test(attr)) continue;
      const [pathname, hash] = attr.split('#');
      let target = pathname ? (pathname.startsWith('/') ? resolve(root, '.' + pathname) : resolve(dirname(path), pathname)) : path;
      const info = await stat(target).catch(() => null);
      assert.ok(info, `${path}: ${attr}`);
      if (info.isDirectory()) target = join(target, 'index.html');
      if (hash) assert.ok((await readFile(target, 'utf8')).includes(`id="${hash}"`), `${path}: missing #${hash}`);
    }
  }
});

test('Original image and CV bytes are preserved in the repository', async () => {
  const original = JSON.parse(await readFile(new URL('../docs/original-assets.json', import.meta.url), 'utf8'));
  for (const file of original) {
    const data = await readFile(new URL('../' + file.path, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), file.sha256, file.path);
    const packaged = await readFile(join(root, file.path));
    assert.equal(createHash('sha256').update(packaged).digest('hex'), file.sha256, `dist/${file.path}`);
  }
});

test('Case studies expose all ten sections in English and Persian without fabricated metrics', async () => {
  for (const lang of ['en', 'fa']) for (const project of projects) {
    const html = await readFile(join(root, lang === 'fa' ? 'fa' : '', 'work', project.slug, 'index.html'), 'utf8');
    for (let i = 0; i < 10; i++) assert.ok(html.includes(`id="note-${i}"`), `${lang}/${project.slug}/${i}`);
    for (const label of copy[lang].projectLabels) assert.ok(html.includes(label));
    assert.ok(!/\b(?:95%|10k users|99\.9% uptime)\b/i.test(html));
  }
});

test('External new-tab links are isolated and no private repository links are published', async () => {
  for (const path of await pages()) {
    const html = await readFile(path, 'utf8');
    for (const link of html.matchAll(/<a\b[^>]+target="_blank"[^>]*>/g)) assert.match(link[0], /rel="noopener noreferrer"/);
    assert.ok(!/github\.com\/erfan-moghaddam\/(?:My_Nex_Park|NexParkDisplay|nexpark-admin-panel)/.test(html));
    assert.ok(!/https?:\/\/(?:localhost|192\.168\.|10\.\d+\.)/.test(html));
  }
});

test('Rendering requires no framework runtime and CSS/JS stay within the size budget', async () => {
  let bytes = 0;
  for (const file of ['site.css', 'app.js', 'theme.js']) bytes += (await stat(join(root, 'assets', file))).size;
  assert.ok(bytes < 75 * 1024, `CSS + JS ${bytes} exceeds 75 KiB`);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.ok(!/fonts\.googleapis|cdnjs|unpkg|_next|gsap|three\.js/.test(html));
  assert.match(html, /Interactive concept · simulated data/);
});
