# Erfan Moghaddam — Engineering Field Notes

A complete static portfolio redesign. English is the default; Persian has pre-rendered RTL routes. There is no browser framework, production dependency, analytics service or backend requirement.

## Run locally

Use Node **22.13+** (Node 24 was used for validation).

```sh
npm ci
npm run dev
```

Open `http://localhost:4174`. `npm run dev` builds once and starts the preview; after editing source files, run `npm run build` to refresh the served output. Set `PORT` to use another port.

```sh
npm run build       # generates the static routes and dist/
npm start           # serves dist/, including proper 404 responses
npm run lint
npm run typecheck   # strict TypeScript checking of the browser JavaScript
npm test            # content, asset preservation, link and metadata checks
npm run test:browser
```

For browser tests, an existing `/usr/bin/chromium` is used when available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a compatible Chromium executable. Browser tests start the preview if it is not already running.

## Edit the source

- `src/content.mjs`: public facts, project evidence, English and Persian copy.
- `src/components.mjs`: shared navigation, product previews, case studies, metadata and page composition.
- `src/site.css`: design tokens, section styles, responsive rules, RTL, print and reduced motion.
- `src/app.js`: parking interaction, product selectors, native menu dialog, clipboard and active navigation.
- `src/theme.js`: preference initialization before the first paint.
- `scripts/build.mjs`: dependency-free static generation and asset packaging.
- `scripts/serve.mjs`: local preview server; not a production hosting service.

`index.html`, `fa/`, `work/`, `assets/site.css`, `assets/app.js`, `assets/theme.js`, `robots.txt`, `sitemap.xml` and `404.html` are generated. **Edit `src/`, then build.** Generated files remain tracked so the original GitHub Pages root deployment model continues to work when the owner chooses to publish. `dist/` contains a clean static distribution and is ignored by Git.

## Routes and preserved links

`/`, `/fa/`, and four case studies under `/work/{slug}/` and `/fa/work/{slug}/`: `mynexpark`, `nexpark-display`, `nexpark-dashboard`, `parking-operations`.

Existing fragments remain available: `#top`, `#main-content`, `#work`, `#nexpark`, `#nexpark-display`, `#nexpark-admin`, `#public-work`, `#capabilities`, `#process`, `#contact`. Original JPEG URLs and both CV filenames are retained. No original page route was removed.

## Evidence and privacy

The consumer app uses original screenshots. The dashboard uses an actual unauthenticated sign-in capture from its local Next.js source. The TV preview is explicitly a reconstructed interface study using verified source strings. The hero is an explicitly simulated system, with no live data or API connection.

Private source code, credentials, backend addresses and customer records are not included. iOS links are retained with a clear explanation that Erfan's contribution is Android development. No usage, revenue, uptime or business-impact numbers are invented.

Font files are self-hosted: Manrope, Newsreader and Vazirmatn, each with its SIL Open Font License in `assets/fonts/`. Original image and CV bytes are checked against `docs/original-assets.json`; optimized WebP derivatives are used in the UI.

## Publication

**No production deployment is part of this delivery.** The canonical URL is the original `https://erfan-moghaddam.github.io/`. The redesign branch must be reviewed before the owner chooses to merge or deploy. The original main branch and remote configuration are preserved.

See [audit](docs/AUDIT_FA.md), [research and direction](docs/RESEARCH_FA.md), and [delivery report](docs/REPORT_FA.md).
