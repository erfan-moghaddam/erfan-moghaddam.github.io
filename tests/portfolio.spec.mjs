import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const lang of ['en', 'fa']) {
  const home = lang === 'fa' ? '/fa/' : '/';
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    test(`${lang}: no overflow, broken media or runtime errors at ${width}px`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(home);
      expect(response.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const image of await page.locator('img:visible').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      }
      expect(errors).toEqual([]);
    });
  }
  test(`${lang}: parking interaction updates occupancy and resets`, async ({ page }) => {
    await page.goto(home);
    const bay = page.locator('[data-bay="1"]');
    await expect(page.locator('[data-space-count]')).toHaveText('03');
    await bay.focus(); await page.keyboard.press('Space');
    await expect(bay).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-space-count]')).toHaveText('02');
    await page.locator('[data-reset]').click();
    await expect(bay).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-space-count]')).toHaveText('03');
  });
  test(`${lang}: actual screenshots and reconstructed TV states switch correctly`, async ({ page }) => {
    await page.goto(home);
    await page.locator('[data-gallery-select="1"]').click();
    await expect(page.locator('[data-gallery-image="1"]')).toBeVisible();
    await expect(page.locator('[data-gallery-image="0"]')).toBeHidden();
    await page.locator('[data-tv-select="1"]').click();
    await expect(page.locator('[data-tv-message]')).toContainText(lang === 'fa' ? 'عدم برقراری' : 'Unable to connect');
    await page.locator('[data-tv-select="0"]').click();
    await expect(page.locator('[data-tv-message]')).toContainText(lang === 'fa' ? 'محاسبه' : 'calculated');
  });
  test(`${lang}: mobile menu contains keyboard focus and returns it on Escape`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(home);
    const trigger = page.locator('[data-open-menu]');
    await trigger.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement.closest('#mobile-menu') !== null)).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click(); await page.locator('#mobile-menu a').first().click();
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${home}#work$`));
  });
  for (const theme of ['light', 'dark']) {
    test(`${lang}/${theme}: WCAG A/AA automated checks`, async ({ page }) => {
      await page.addInitScript((saved) => localStorage.setItem('portfolio_theme', saved), theme);
      await page.goto(home); await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    });
  }
  for (const slug of ['mynexpark', 'nexpark-display', 'nexpark-dashboard', 'parking-operations']) {
    test(`${lang}/${slug}: case study works at 320px and passes automated accessibility`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      const response = await page.goto(`${home}work/${slug}/`);
      expect(response.status()).toBe(200);
      await expect(page.locator('.case-notes section')).toHaveCount(10);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    });
  }
}

test('Language links preserve the project route; theme survives navigation and reload', async ({ page }) => {
  await page.goto('/work/mynexpark/');
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/fa/work/mynexpark/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Essential content and navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:4174/');
  await expect(page.locator('h1')).toBeVisible(); await expect(page.locator('.nav-links')).toBeVisible();
  await page.locator('.case-link').first().click(); await expect(page.locator('.case-notes section')).toHaveCount(10);
  await context.close();
});

test('Reduced motion disables entrance effects and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  expect(await page.locator('h1').evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
  expect(await page.locator('html').evaluate((node) => getComputedStyle(node).scrollBehavior)).toBe('auto');
  await expect(page.locator('h1')).toBeVisible();
});

test('An existing Persian preference is retained when opening an English route', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio_lang', 'fa'));
  await page.goto('/work/nexpark-display/');
  await expect(page).toHaveURL('/fa/work/nexpark-display/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('Copy email gives visible and accessible success feedback', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/'); await page.locator('[data-copy-email]').click();
  await expect(page.locator('#announcements')).toHaveText('Email copied');
  await expect(page.locator('#announcements')).toBeVisible();
  await expect(page.locator('[data-copy-email]')).toHaveAttribute('aria-label', 'Copy email address');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('erfanmusicmoghaddam@gmail.com');
});

test('Unavailable clipboard shows a truthful fallback; 404 returns a usable page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } }); });
  await page.locator('[data-copy-email]').click();
  await expect(page.locator('#announcements')).toHaveText('Copy unavailable. Use the email link.');
  const response = await page.goto('/missing-field-note/');
  expect(response.status()).toBe(404); await expect(page.locator('h1')).toContainText('moved');
});

test('Every public route loads without console errors, failed requests or HTTP errors', async ({ page }) => {
  const failures = [];
  page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('requestfailed', (request) => failures.push(request.url()));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  for (const base of ['/', '/fa/']) {
    for (const route of ['', 'work/mynexpark/', 'work/nexpark-display/', 'work/nexpark-dashboard/', 'work/parking-operations/']) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      expect(response.status()).toBe(200);
    }
  }
  expect(failures).toEqual([]);
});
