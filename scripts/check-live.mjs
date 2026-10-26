// Weekly health check of the live site's SEO, AEO and GEO signals.
//   node scripts/check-live.mjs [outDir]
// Fetches every page and machine-readable file, checks them against what the build is
// meant to produce, compares with the last run's snapshot, and writes report.md plus
// snapshot.json to outDir (default scalea.vercel.app-audit/monitor). Exits 1 if any
// check fails. Reads the page list and origin from src/seo.js.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { ORIGIN, PAGES } = await import(pathToFileURL(resolve('src/seo.js')).href);
const outDir = resolve(process.argv[2] || 'scalea.vercel.app-audit/monitor');
mkdirSync(outDir, { recursive: true });

const SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
const TRAINING_ALLOWED = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];
const TRAINING_BLOCKED = ['Bytespider'];

const results = []; // { area, check, ok, detail }
const snapshot = { checkedAt: new Date().toISOString(), origin: ORIGIN, pages: {}, files: {}, timings: {} };
const check = (area, name, ok, detail = '') => results.push({ area, check: name, ok: Boolean(ok), detail });
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);
const pick = (html, re) => html.match(re)?.[1]?.trim() ?? null;
const text = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function get(path, headers = {}, method = 'GET') {
  const start = performance.now();
  try {
    const res = await fetch(ORIGIN + path, { headers: { 'User-Agent': 'scalea-weekly-check', ...headers }, method, redirect: 'manual' });
    const body = method === 'HEAD' ? '' : await res.text();
    return { status: res.status, headers: res.headers, body, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return { status: 0, headers: new Headers(), body: '', ms: 0, error: e.message };
  }
}

// --- SEO: every page in src/seo.js -------------------------------------------------------
for (const [path, meta] of Object.entries(PAGES)) {
  const r = await get(path, { Accept: 'text/html' });
  snapshot.timings[path] = r.ms;
  check('SEO', `${path} returns 200 HTML`, r.status === 200 && r.headers.get('content-type')?.includes('text/html'), `${r.status} ${r.headers.get('content-type') ?? r.error ?? ''}`);
  if (r.status !== 200) continue;
  const root = pick(r.body, /<div id="root">([\s\S]*)<\/div>\s*<\/body>/) || '';
  const p = {
    title: pick(r.body, /<title>([^<]*)<\/title>/),
    description: pick(r.body, /<meta name="description" content="([^"]*)"/),
    canonical: pick(r.body, /<link rel="canonical" href="([^"]*)"/),
    aiSummary: pick(r.body, /<meta name="ai-summary" content="([^"]*)"/),
    mdAlternate: pick(r.body, /<link rel="alternate" type="text\/markdown" href="([^"]*)"/),
    ogImage: pick(r.body, /<meta property="og:image" content="([^"]*)"/),
    h1: text(pick(r.body, /<h1[^>]*>([\s\S]*?)<\/h1>/) || '') || null,
    jsonLd: (r.body.match(/application\/ld\+json/g) || []).length,
    noindex: /<meta name="robots" content="[^"]*noindex/.test(r.body),
    words: text(root).split(' ').filter(Boolean).length,
  };
  snapshot.pages[path] = { ...p, contentHash: hash(text(root)) };
  check('SEO', `${path} title matches src/seo.js`, p.title?.replace(/&amp;/g, '&') === meta.title, p.title);
  check('SEO', `${path} has a meta description`, p.description && p.description.length >= 50, `${p.description?.length ?? 0} chars`);
  check('SEO', `${path} canonical points to itself`, p.canonical === ORIGIN + path, p.canonical);
  check('SEO', `${path} is indexable`, !p.noindex);
  check('SEO', `${path} has one H1`, p.h1, p.h1);
  check('SEO', `${path} content is in the HTML (prerendered)`, p.words >= 50, `${p.words} words`);
  check('SEO', `${path} has an og:image`, p.ogImage);
  if (path === '/') check('SEO', '/ has Organization JSON-LD', p.jsonLd >= 1, `${p.jsonLd} block(s)`);
  check('AEO/GEO', `${path} has ai-summary meta`, p.aiSummary);
  check('AEO/GEO', `${path} links its markdown version`, p.mdAlternate);
  check('SEO', `${path} responds in under 1.5s`, r.ms < 1500, `${r.ms} ms`);
}

const head = await get('/');
check('SEO', 'HTML advertises llms.txt / ai.txt (Link describedby)', /rel="describedby"/.test(head.headers.get('link') || ''));
const missing = await get('/this-page-should-not-exist');
check('SEO', 'Unknown URLs return a real 404', missing.status === 404, String(missing.status));

// --- Sitemap and robots.txt -------------------------------------------------------------
const sitemap = await get('/sitemap.xml');
snapshot.files['sitemap.xml'] = { status: sitemap.status, hash: hash(sitemap.body) };
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check('SEO', 'sitemap.xml is served', sitemap.status === 200, `${locs.length} URLs`);
check('SEO', 'sitemap.xml lists every page', Object.keys(PAGES).every((p) => locs.includes(ORIGIN + p)));
check('SEO', 'sitemap.xml has no .md URLs', !locs.some((l) => l.endsWith('.md')));

const robots = await get('/robots.txt');
snapshot.files['robots.txt'] = { status: robots.status, hash: hash(robots.body) };
check('SEO', 'robots.txt is served', robots.status === 200);
check('SEO', 'robots.txt does not block everyone', !/User-agent: \*\s*\n(?:[^\n]*\n)*?Disallow: \/\s*$/m.test(robots.body.split('\n\n').find((g) => g.includes('User-agent: *')) || ''));
check('SEO', 'robots.txt has a Sitemap line', robots.body.includes(`Sitemap: ${ORIGIN}/sitemap.xml`));
const groupFor = (bot) => robots.body.split(/\n\s*\n/).find((g) => g.split('\n').some((l) => l.trim() === `User-agent: ${bot}`)) || '';
for (const bot of [...SEARCH_BOTS, ...TRAINING_ALLOWED]) {
  check('AEO/GEO', `robots.txt allows ${bot}`, /Allow: \/\s*$/m.test(groupFor(bot)) && !/^Disallow: \/\s*$/m.test(groupFor(bot)));
}
for (const bot of TRAINING_BLOCKED) check('AEO/GEO', `robots.txt blocks ${bot}`, /^Disallow: \/\s*$/m.test(groupFor(bot)));

// --- AEO/GEO: markdown versions and AI files --------------------------------------------
for (const path of Object.keys(PAGES)) {
  const md = path === '/' ? '/index.md' : `${path}.md`;
  const r = await get(md);
  check('AEO/GEO', `${md} returns markdown`, r.status === 200 && r.headers.get('content-type')?.startsWith('text/markdown'), `${r.status} ${r.headers.get('content-type') ?? ''}`);
  check('AEO/GEO', `${md} is noindex with a canonical`, r.headers.get('x-robots-tag')?.includes('noindex') && r.headers.get('content-location') === ORIGIN + path);
  snapshot.files[md] = { status: r.status, hash: hash(r.body), tokens: Number(r.headers.get('x-markdown-tokens')) || null };
}
const neg = await get('/start', { Accept: 'text/markdown' });
check('AEO/GEO', 'Accept: text/markdown gets markdown', neg.headers.get('content-type')?.startsWith('text/markdown'));
const html = await get('/start', { Accept: '*/*' });
check('AEO/GEO', 'Accept: */* still gets HTML', html.headers.get('content-type')?.startsWith('text/html'));
const md404 = await get('/does-not-exist.md');
check('AEO/GEO', 'Unknown .md returns a markdown 404', md404.status === 404 && md404.headers.get('content-type')?.startsWith('text/markdown'), String(md404.status));

const llms = await get('/llms.txt');
snapshot.files['llms.txt'] = { status: llms.status, hash: hash(llms.body) };
check('AEO/GEO', 'llms.txt is served as text/plain', llms.status === 200 && llms.headers.get('content-type')?.startsWith('text/plain'));
const links = [...llms.body.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1]).filter((u) => u.startsWith(ORIGIN));
for (const url of links) {
  const r = await get(url.slice(ORIGIN.length));
  check('AEO/GEO', `llms.txt link works: ${url.slice(ORIGIN.length)}`, r.status === 200, String(r.status));
}
for (const f of ['/llms-full.txt', '/ai.txt', '/api/md/_catalog']) {
  const r = await get(f);
  snapshot.files[f] = { status: r.status, hash: hash(r.body), size: r.body.length };
  check('AEO/GEO', `${f} is served`, r.status === 200, `${r.status}, ${r.body.length} chars`);
}

// --- Compare with last week --------------------------------------------------------------
const snapFile = resolve(outDir, 'snapshot.json');
const prev = existsSync(snapFile) ? JSON.parse(readFileSync(snapFile, 'utf8')) : null;
const changes = [];
if (prev) {
  for (const [path, p] of Object.entries(snapshot.pages)) {
    const o = prev.pages?.[path];
    if (!o) { changes.push(`New page: ${path}`); continue; }
    for (const k of ['title', 'description', 'canonical', 'h1', 'aiSummary', 'jsonLd', 'noindex']) {
      if (JSON.stringify(o[k]) !== JSON.stringify(p[k])) changes.push(`${path} ${k}: ${JSON.stringify(o[k])} → ${JSON.stringify(p[k])}`);
    }
    if (o.contentHash !== p.contentHash) changes.push(`${path} page content changed (${o.words} → ${p.words} words)`);
    const t0 = prev.timings?.[path], t1 = snapshot.timings[path];
    if (t0 && t1 > t0 * 2 && t1 > 800) changes.push(`${path} got slower: ${t0} ms → ${t1} ms`);
  }
  for (const path of Object.keys(prev.pages || {})) if (!snapshot.pages[path]) changes.push(`Page gone: ${path}`);
  for (const [f, v] of Object.entries(snapshot.files)) {
    const o = prev.files?.[f];
    if (o && o.hash !== v.hash) changes.push(`${f} changed`);
    if (o && o.status !== v.status) changes.push(`${f} status ${o.status} → ${v.status}`);
  }
}

// --- Report -----------------------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
const lines = [
  `# Weekly site check: ${ORIGIN}`,
  '',
  `Checked ${snapshot.checkedAt.slice(0, 16).replace('T', ' ')} UTC. ${results.length - failed.length}/${results.length} checks passed.`,
  '',
  '## Failing',
  '',
  ...(failed.length ? failed.map((r) => `- **[${r.area}] ${r.check}**${r.detail ? `: ${r.detail}` : ''}`) : ['None.']),
  '',
  '## Changed since last check',
  '',
  ...(prev ? (changes.length ? changes.map((c) => `- ${c}`) : ['Nothing.']) : ['First run; this is the baseline.']),
  '',
  '## Response times',
  '',
  ...Object.entries(snapshot.timings).map(([p, ms]) => `- ${p}: ${ms} ms`),
  '',
  '## All checks',
  '',
  ...results.map((r) => `- ${r.ok ? 'PASS' : 'FAIL'} [${r.area}] ${r.check}${r.detail ? ` (${r.detail})` : ''}`),
  '',
];
writeFileSync(resolve(outDir, 'report.md'), lines.join('\n'));
if (prev) writeFileSync(resolve(outDir, 'snapshot.previous.json'), JSON.stringify(prev, null, 2));
writeFileSync(snapFile, JSON.stringify(snapshot, null, 2));
console.log(`${results.length - failed.length}/${results.length} passed, ${failed.length} failing, ${changes.length} changed. Report: ${resolve(outDir, 'report.md')}`);
process.exit(failed.length ? 1 : 0);
