// Runs after `vite build`. For every page it writes its own HTML file (with that page's
// title, description, canonical, ai-summary and markdown alternate) and its markdown version,
// then a 404 page, sitemap.xml, robots.txt, llms.txt, llms-full.txt, ai.txt and the markdown
// catalog. The browser app still takes over as before; this is what search and AI crawlers
// read. Fails the build if a page has no markdown version.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dist = resolve('dist');
const ssr = resolve('dist-ssr');
const { ORIGIN, PAGES, NOT_FOUND } = await import(pathToFileURL(resolve('src/seo.js')).href);
const app = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href);

// Routes that deliberately have no markdown version, with the reason.
const SKIP = {};

const missing = app.appRoutes.filter((p) => !SKIP[p] && !(PAGES[p] && app.hasRenderer(p)));
if (missing.length) {
  console.error(`No markdown renderer (src/md/registry.jsx) or seo entry (src/seo.js) for: ${missing.join(', ')}`);
  process.exit(1);
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const mdPath = (path) => (path === '/' ? '/index.md' : `${path}.md`);

// index.html is written for the home page on scalea.vercel.app; swap in each page's details.
function page(template, path, meta, body, { noindex = false, jsonLd = null } = {}) {
  const url = ORIGIN + path;
  const extra = [`<meta name="ai-summary" content="${escape(meta.summary || meta.description)}" />`];
  if (!noindex) extra.push(`<link rel="alternate" type="text/markdown" href="${ORIGIN}${mdPath(path)}" />`);
  if (jsonLd) extra.push(`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`);
  let html = template
    .replaceAll('https://scalea.vercel.app', ORIGIN)
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(meta.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace('<meta name="theme-color"', `${extra.join('\n    ')}\n    <meta name="theme-color"`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  if (noindex) {
    html = html
      .replace(/\s*<link rel="canonical"[^>]*>/, '')
      .replace('<meta name="viewport"', '<meta name="robots" content="noindex" />\n    <meta name="viewport"');
  }
  return html;
}

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

for (const path of Object.keys(PAGES)) {
  const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  const jsonLd = path === '/' ? app.organizationJsonLd() : null;
  writeFileSync(resolve(dist, file), page(template, path, PAGES[path], await app.render(path), { jsonLd }));
  console.log(`prerendered ${path} -> ${file}`);
}

writeFileSync(resolve(dist, '404.html'), page(template, '/404', NOT_FOUND, await app.render('/404'), { noindex: true }));
console.log('prerendered 404.html');

// Markdown lives under /_md/; middleware.js serves it at /<page>.md, /api/md/<page> and on
// Accept: text/markdown, with the right headers.
mkdirSync(resolve(dist, '_md'), { recursive: true });
for (const r of app.listMarkdownRoutes()) {
  writeFileSync(resolve(dist, `_md${r.md}`), app.renderMarkdown(r.path));
  console.log(`markdown ${r.path} -> _md${r.md}`);
}
writeFileSync(resolve(dist, '_md/_catalog.json'), JSON.stringify(app.catalog(), null, 2) + '\n');

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    Object.keys(PAGES).map((p) => `  <url><loc>${ORIGIN}${p}</loc><lastmod>${today}</lastmod></url>\n`).join('') +
    `</urlset>\n`
);
writeFileSync(resolve(dist, 'robots.txt'), app.robotsTxt());
writeFileSync(resolve(dist, 'llms.txt'), app.llmsTxt());
writeFileSync(resolve(dist, 'llms-full.txt'), app.llmsFullTxt());
writeFileSync(resolve(dist, 'ai.txt'), app.aiTxt());
console.log('wrote sitemap.xml, robots.txt, llms.txt, llms-full.txt, ai.txt and the markdown catalog');
